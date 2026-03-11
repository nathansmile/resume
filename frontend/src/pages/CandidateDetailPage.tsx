import React, { useState } from 'react';
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
} from 'antd';
import { candidatesApi, createExtractionSSE } from '../lib/api';
import type { Candidate, CandidateStatus } from '../types';

const statusLabels: Record<CandidateStatus, string> = {
  PENDING: '待筛选',
  INITIAL_PASS: '初筛通过',
  INTERVIEWING: '面试中',
  HIRED: '已录用',
  REJECTED: '已淘汰',
};

export const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [extracting, setExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState('');

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidatesApi.getOne(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      candidatesApi.updateStatus(id, status),
    onSuccess: () => {
      message.success('状态更新成功');
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
    },
  });

  const startExtraction = () => {
    if (!id) return;

    setExtracting(true);
    setExtractionProgress('正在连接 AI...');

    const eventSource = createExtractionSSE(id);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'text') {
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

  const candidateData: Candidate = candidate?.data;

  if (!candidateData) {
    return <div>候选人不存在</div>;
  }

  const needsExtraction =
    !candidateData.educations?.length &&
    !candidateData.workExperiences?.length &&
    !candidateData.skills?.length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <h1>{candidateData.name}</h1>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Select
            value={candidateData.status}
            style={{ width: 150, marginRight: 8 }}
            onChange={(status) =>
              updateStatusMutation.mutate({ id: candidateData.id, status })
            }
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <Select.Option key={key} value={key}>
                {label}
              </Select.Option>
            ))}
          </Select>
          {needsExtraction && (
            <Button
              type="primary"
              onClick={startExtraction}
              loading={extracting}
            >
              {extracting ? extractionProgress : '开始 AI 提取'}
            </Button>
          )}
        </Col>
      </Row>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="姓名">{candidateData.name}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{candidateData.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="电话">{candidateData.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="城市">{candidateData.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="上传时间">
            {new Date(candidateData.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {candidateData.skills && candidateData.skills.length > 0 && (
        <Card title="技能标签" style={{ marginBottom: 16 }}>
          {candidateData.skills.map((skill) => (
            <Tag key={skill.id} color="blue" style={{ marginBottom: 8 }}>
              {skill.skillName}
            </Tag>
          ))}
        </Card>
      )}

      {candidateData.educations && candidateData.educations.length > 0 && (
        <Card title="教育背景" style={{ marginBottom: 16 }}>
          <Timeline>
            {candidateData.educations.map((edu) => (
              <Timeline.Item key={edu.id}>
                <p style={{ fontWeight: 'bold' }}>{edu.school}</p>
                <p>
                  {edu.major} · {edu.degree}
                </p>
                {edu.graduationDate && (
                  <p style={{ color: '#999' }}>
                    毕业时间: {new Date(edu.graduationDate).toLocaleDateString('zh-CN')}
                  </p>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {candidateData.workExperiences && candidateData.workExperiences.length > 0 && (
        <Card title="工作经历" style={{ marginBottom: 16 }}>
          <Timeline>
            {candidateData.workExperiences.map((work) => (
              <Timeline.Item key={work.id}>
                <p style={{ fontWeight: 'bold' }}>
                  {work.company} · {work.position}
                </p>
                <p style={{ color: '#999' }}>
                  {work.startDate && new Date(work.startDate).toLocaleDateString('zh-CN')} -{' '}
                  {work.endDate ? new Date(work.endDate).toLocaleDateString('zh-CN') : '至今'}
                </p>
                {work.description && <p>{work.description}</p>}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {candidateData.projects && candidateData.projects.length > 0 && (
        <Card title="项目经历">
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
