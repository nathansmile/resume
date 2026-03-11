import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Descriptions,
  Tag,
  Timeline,
  Select,
  Button,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Progress,
  Space,
} from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { candidatesApi, createExtractionSSE } from '../lib/api';
import type { Candidate, CandidateStatus } from '../types';
import type { ReactNode } from 'react';

const statusLabels: Record<CandidateStatus, string> = {
  PENDING: '待筛选',
  INITIAL_PASS: '初筛通过',
  INTERVIEWING: '面试中',
  HIRED: '已录用',
  REJECTED: '已淘汰',
};

const statusColors: Record<CandidateStatus, string> = {
  PENDING: 'default',
  INITIAL_PASS: 'processing',
  INTERVIEWING: 'warning',
  HIRED: 'success',
  REJECTED: 'error',
};

const statusIcons: Record<CandidateStatus, ReactNode> = {
  PENDING: <ClockCircleOutlined />,
  INITIAL_PASS: <SyncOutlined spin />,
  INTERVIEWING: <SyncOutlined spin />,
  HIRED: <CheckCircleOutlined />,
  REJECTED: <ClockCircleOutlined />,
};

export const CandidateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [extracting, setExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidatesApi.getOne(id!),
  });

  const statusMutation = useMutation({
    mutationFn: (status: CandidateStatus) =>
      candidatesApi.updateStatus(id!, status),
    onSuccess: () => {
      message.success('状态更新成功');
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
    },
    onError: () => {
      message.error('状态更新失败');
    },
  });

  const handleExtract = () => {
    if (!id) return;

    setExtracting(true);
    setExtractionProgress('正在连接 AI 服务...');

    const eventSource = createExtractionSSE(id);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          setExtractionProgress(data.message);
        } else if (data.type === 'text') {
          setExtractionProgress('AI 正在分析简历...');
        } else if (data.type === 'complete') {
          setExtractionProgress('提取完成！');
          message.success('信息提取成功');
          queryClient.invalidateQueries({ queryKey: ['candidate', id] });
          eventSource.close();
          setExtracting(false);
        } else if (data.type === 'error') {
          message.error('提取失败: ' + data.error);
          eventSource.close();
          setExtracting(false);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      message.error('连接失败');
      eventSource.close();
      setExtracting(false);
    };
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const candidateData: Candidate = data?.data;

  if (!candidateData) {
    return <div>候选人不存在</div>;
  }

  const currentStatus = candidateData.status as CandidateStatus;

  return (
    <div>
      <Card
        title="候选人基本信息"
        extra={
          <Space>
            <Select
              value={currentStatus}
              style={{ width: 150 }}
              onChange={(value) => statusMutation.mutate(value)}
              loading={statusMutation.isPending}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  <Space>
                    {statusIcons[key as CandidateStatus]}
                    <Tag color={statusColors[key as CandidateStatus]}>{label}</Tag>
                  </Space>
                </Select.Option>
              ))}
            </Select>
            <Button type="primary" onClick={handleExtract} loading={extracting}>
              {extracting ? '提取中...' : 'AI 提取信息'}
            </Button>
          </Space>
        }
      >
        {extracting && (
          <div style={{ marginBottom: 16 }}>
            <Progress percent={50} status="active" />
            <p style={{ marginTop: 8, color: '#666' }}>{extractionProgress}</p>
          </div>
        )}

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <Space size="large">
                <div>
                  <strong>当前状态：</strong>
                  <Tag
                    color={statusColors[currentStatus]}
                    icon={statusIcons[currentStatus]}
                    style={{ marginLeft: 8 }}
                  >
                    {statusLabels[currentStatus]}
                  </Tag>
                </div>
                <div>
                  <strong>上传时间：</strong>
                  {new Date(candidateData.createdAt).toLocaleString('zh-CN')}
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="姓名">{candidateData.name}</Descriptions.Item>
          <Descriptions.Item label="电话">{candidateData.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{candidateData.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="城市">{candidateData.city || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {candidateData.skills && candidateData.skills.length > 0 && (
        <Card title="技能标签" style={{ marginTop: 16 }}>
          {candidateData.skills.map((skill) => (
            <Tag key={skill.id} color="blue" style={{ marginBottom: 8 }}>
              {skill.skillName}
            </Tag>
          ))}
        </Card>
      )}

      {candidateData.educations && candidateData.educations.length > 0 && (
        <Card title="教育背景" style={{ marginTop: 16 }}>
          <Timeline>
            {candidateData.educations.map((edu) => (
              <Timeline.Item key={edu.id}>
                <h3>{edu.school}</h3>
                <p>
                  {edu.major} - {edu.degree}
                </p>
                <p style={{ color: '#999' }}>{edu.graduationDate}</p>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {candidateData.workExperiences && candidateData.workExperiences.length > 0 && (
        <Card title="工作经历" style={{ marginTop: 16 }}>
          <Timeline>
            {candidateData.workExperiences.map((work) => (
              <Timeline.Item key={work.id}>
                <h3>
                  {work.position} @ {work.company}
                </h3>
                <p style={{ color: '#999' }}>
                  {work.startDate ? new Date(work.startDate).toLocaleDateString('zh-CN') : ''} -{' '}
                  {work.endDate ? new Date(work.endDate).toLocaleDateString('zh-CN') : '至今'}
                </p>
                {work.description && <p>{work.description}</p>}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {candidateData.projects && candidateData.projects.length > 0 && (
        <Card title="项目经历" style={{ marginTop: 16 }}>
          {candidateData.projects.map((project) => (
            <div key={project.id} style={{ marginBottom: 16 }}>
              <h3>{project.projectName}</h3>
              <p>
                <strong>技术栈:</strong>{' '}
                {project.techStack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </p>
              {project.role && (
                <p>
                  <strong>角色:</strong> {project.role}
                </p>
              )}
              {project.highlights && (
                <p>
                  <strong>亮点:</strong> {project.highlights}
                </p>
              )}
              <Divider />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
