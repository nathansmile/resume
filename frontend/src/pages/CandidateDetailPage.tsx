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
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, FilePdfOutlined, TrophyOutlined } from '@ant-design/icons';
import { candidatesApi, createExtractionSSE, STATIC_BASE_URL } from '../lib/api';
import { EvaluationModal } from '../components/EvaluationModal';
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
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);

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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button
          icon={<TrophyOutlined />}
          onClick={() => setEvaluationModalOpen(true)}
        >
          岗位匹配评分
        </Button>
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
      </div>

      {extracting && (
        <Card style={{ marginBottom: 16 }}>
          <Progress percent={50} status="active" />
          <p style={{ marginTop: 8, color: '#666' }}>{extractionProgress}</p>
        </Card>
      )}

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="候选人基本信息" style={{ height: '100%' }}>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: 16 }}>
              <Space size="large" direction="vertical" style={{ width: '100%' }}>
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

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="姓名">{candidateData.name}</Descriptions.Item>
              <Descriptions.Item label="电话">{candidateData.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{candidateData.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="城市">{candidateData.city || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {candidateData.pdfUrl && (
            <Card
              title="PDF 预览"
              style={{ height: '100%' }}
              extra={
                <Button
                  type="link"
                  icon={<FilePdfOutlined />}
                  href={`${STATIC_BASE_URL}${candidateData.pdfUrl}`}
                  target="_blank"
                >
                  下载原文件
                </Button>
              }
            >
              <iframe
                src={`${STATIC_BASE_URL}${candidateData.pdfUrl}`}
                style={{ width: '100%', height: '600px', border: 'none' }}
                title="PDF Preview"
              />
            </Card>
          )}
        </Col>
      </Row>

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
                  {edu.major} {edu.degree && `· ${edu.degree}`}
                </p>
                <p style={{ color: '#999' }}>
                  {edu.graduationDate
                    ? new Date(edu.graduationDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
                    : '-'}
                </p>
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
                  {work.startDate
                    ? new Date(work.startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
                    : '-'} - {' '}
                  {work.endDate
                    ? new Date(work.endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
                    : '至今'}
                </p>
                {work.description && <p style={{ marginTop: 8 }}>{work.description}</p>}
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

      <EvaluationModal
        open={evaluationModalOpen}
        onClose={() => {
          setEvaluationModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['candidate', id] });
        }}
        candidateId={candidateData.id}
        candidateName={candidateData.name}
        existingEvaluations={candidateData.evaluations || []}
      />
    </div>
  );
};
