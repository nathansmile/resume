import { useState } from 'react';
import { Modal, Select, Button, Spin, Card, Row, Col, Tag, Space, message } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { jobsApi, evaluationsApi } from '../lib/api';
import type { Evaluation } from '../types';

interface EvaluationModalProps {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  existingEvaluations?: Evaluation[];
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  open,
  onClose,
  candidateId,
  candidateName,
  existingEvaluations = [],
}) => {
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(existingEvaluations);

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.getAll(),
    enabled: open,
  });

  const createEvaluationMutation = useMutation({
    mutationFn: (jobId: string) =>
      evaluationsApi.create({ candidateId, jobId }),
    onSuccess: (response) => {
      const newEval = response.data;
      setEvaluations((prev) => [...prev, newEval]);
      message.success('评分完成');
    },
    onError: () => {
      message.error('评分失败');
    },
  });

  const handleEvaluate = async () => {
    if (selectedJobIds.length === 0) {
      message.warning('请至少选择一个岗位');
      return;
    }

    for (const jobId of selectedJobIds) {
      const existing = evaluations.find((e) => e.jobId === jobId);
      if (!existing) {
        await createEvaluationMutation.mutateAsync(jobId);
      }
    }
  };

  const getRadarData = (evaluation: Evaluation) => [
    { subject: '技能匹配', score: evaluation.skillMatchScore, fullMark: 100 },
    { subject: '经验相关', score: evaluation.experienceScore, fullMark: 100 },
    { subject: '教育背景', score: evaluation.educationScore, fullMark: 100 },
  ];

  const getComparisonData = () => {
    return evaluations.map((e) => ({
      name: e.jobDescription?.title || '未知岗位',
      综合评分: e.overallScore,
      技能匹配: e.skillMatchScore,
      经验相关: e.experienceScore,
      教育背景: e.educationScore,
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#1890ff';
    return '#faad14';
  };

  return (
    <Modal
      title={`岗位匹配评分 - ${candidateName}`}
      open={open}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small" title="选择岗位进行评分">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              mode="multiple"
              placeholder="选择一个或多个岗位"
              style={{ width: '100%' }}
              value={selectedJobIds}
              onChange={setSelectedJobIds}
              options={jobs?.data?.map((job: any) => ({
                label: job.title,
                value: job.id,
              }))}
            />
            <Button
              type="primary"
              onClick={handleEvaluate}
              loading={createEvaluationMutation.isPending}
              disabled={selectedJobIds.length === 0}
            >
              开始评分
            </Button>
          </Space>
        </Card>

        {createEvaluationMutation.isPending && (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#666' }}>AI 正在分析匹配度...</p>
            </div>
          </Card>
        )}

        {evaluations.length > 1 && (
          <Card title="多岗位对比">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getComparisonData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="综合评分" fill="#8884d8" />
                <Bar dataKey="技能匹配" fill="#82ca9d" />
                <Bar dataKey="经验相关" fill="#ffc658" />
                <Bar dataKey="教育背景" fill="#ff7c7c" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {evaluations.map((evaluation) => (
          <Card
            key={evaluation.id}
            title={
              <Space>
                <span>{evaluation.jobDescription?.title || '未知岗位'}</span>
                <Tag color={getScoreColor(evaluation.overallScore)}>
                  综合评分: {evaluation.overallScore.toFixed(1)}
                </Tag>
              </Space>
            }
          >
            <Row gutter={24}>
              <Col span={12}>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData(evaluation)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="评分"
                      dataKey="score"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Col>

              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>技能匹配度</span>
                      <span style={{ float: 'right', color: getScoreColor(evaluation.skillMatchScore) }}>
                        {evaluation.skillMatchScore.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${evaluation.skillMatchScore}%`,
                          height: 20,
                          background: getScoreColor(evaluation.skillMatchScore),
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>经验相关性</span>
                      <span style={{ float: 'right', color: getScoreColor(evaluation.experienceScore) }}>
                        {evaluation.experienceScore.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${evaluation.experienceScore}%`,
                          height: 20,
                          background: getScoreColor(evaluation.experienceScore),
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>教育背景契合度</span>
                      <span style={{ float: 'right', color: getScoreColor(evaluation.educationScore) }}>
                        {evaluation.educationScore.toFixed(1)}
                      </span>
             </div>
                    <div style={{ background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${evaluation.educationScore}%`,
                          height: 20,
                          background: getScoreColor(evaluation.educationScore),
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>

            <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>AI 评语</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {evaluation.aiComment}
              </div>
            </div>
          </Card>
        ))}

        {evaluations.length === 0 && !createEvaluationMutation.isPending && (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              请选择岗位开始评分
            </div>
          </Card>
        )}
      </Space>
    </Modal>
  );
};
