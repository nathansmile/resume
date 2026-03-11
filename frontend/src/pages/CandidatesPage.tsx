import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Select, Button, Tag, Space, Card, Row, Col, Checkbox, Modal, Descriptions } from 'antd';
import { EyeOutlined, AppstoreOutlined, UnorderedListOutlined, SwapOutlined } from '@ant-design/icons';
import { resumesApi } from '../lib/api';
import type { Candidate, CandidateStatus } from '../types';

const { Search } = Input;
const { Option } = Select;

const statusColors: Record<CandidateStatus, string> = {
  PENDING: 'default',
  INITIAL_PASS: 'processing',
  INTERVIEWING: 'warning',
  HIRED: 'success',
  REJECTED: 'error',
};

const statusLabels: Record<CandidateStatus, string> = {
  PENDING: '待筛选',
  INITIAL_PASS: '初筛通过',
  INTERVIEWING: '面试中',
  HIRED: '已录用',
  REJECTED: '已淘汰',
};

export const CandidatesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', page, pageSize, status, search],
    queryFn: () =>
      resumesApi.getAll({
        page,
        pageSize,
        status,
        search,
      }),
  });

  const handleCompare = () => {
    if (selectedCandidates.length < 2 || selectedCandidates.length > 3) {
      return;
    }
    setCompareModalVisible(true);
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const columns = [
    {
      title: '选择',
      key: 'select',
      width: 60,
      render: (_: any, record: Candidate) => (
        <Checkbox
          checked={selectedCandidates.includes(record.id)}
          onChange={() => toggleSelectCandidate(record.id)}
        />
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_: any, record: Candidate) => (
        <div>
          <div>{record.email}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: '技能',
      key: 'skills',
      render: (_: any, record: Candidate) => {
        const skills = record.skills || [];
        return (
          <>
            {skills.slice(0, 3).map((skill) => (
              <Tag key={skill.id}>{skill.skillName}</Tag>
            ))}
            {skills.length > 3 && <Tag>+{skills.length - 3}</Tag>}
          </>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: CandidateStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: '评分',
      key: 'score',
      width: 80,
      render: (_: any, record: Candidate) => {
        const latestEval = record.evaluations?.[0];
        return latestEval ? (
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {latestEval.overallScore.toFixed(0)}
          </span>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        );
      },
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Candidate) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/candidates/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  const renderCardView = () => {
    const candidates = data?.data.data || [];
    return (
      <Row gutter={[16, 16]}>
        {candidates.map((candidate: Candidate) => {
          const latestEval = candidate.evaluations?.[0];
          const isSelected = selectedCandidates.includes(candidate.id);
          
          return (
            <Col key={candidate.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                style={{
                  border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
                }}
                onClick={() => navigate(`/candidates/${candidate.id}`)}
              >
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectCandidate(candidate.id);
                    }}
                  />
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: '8px 0' }}>{candidate.name}</h3>
                  <Tag color={statusColors[candidate.status]}>
                    {statusLabels[candidate.status]}
                  </Tag>
                </div>

                {latestEval && (
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                      {latestEval.overallScore.toFixed(0)}
                    </div>
                    <div style={{ color: '#999', fontSize: '12px' }}>综合评分</div>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#999' }}>邮箱：</span>
                    {candidate.email || '-'}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#999' }}>电话：</span>
                    {candidate.phone || '-'}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#999' }}>城市：</span>
                    {candidate.city || '-'}
                  </div>
                </div>

                <div>
                  {(candidate.skills || []).slice(0, 4).map((skill) => (
                    <Tag key={skill.id} style={{ marginBottom: 4 }}>
                      {skill.skillName}
                    </Tag>
                  ))}
                  {(candidate.skills?.length || 0) > 4 && (
                    <Tag>+{(candidate.skills?.length || 0) - 4}</Tag>
                  )}
                </div>

                <div style={{ marginTop: 12, color: '#999', fontSize: '12px' }}>
                  {new Date(candidate.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  const renderCompareModal = () => {
    const candidates = (data?.data.data || []).filter((c: Candidate) =>
      selectedCandidates.includes(c.id)
    );

    return (
      <Modal
        title="候选人对比"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        width={1200}
        footer={null}
      >
        <Row gutter={16}>
          {candidates.map((candidate: Candidate) => {
            const latestEval = candidate.evaluations?.[0];
            return (
              <Col key={candidate.id} span={24 / candidates.length}>
                <Card>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h3>{candidate.name}</h3>
                    <Tag color={statusColors[candidate.status]}>
                      {statusLabels[candidate.status]}
                    </Tag>
                  </div>

                  {latestEval && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1890ff' }}>
                          {latestEval.overallScore.toFixed(0)}
                        </div>
                        <div style={{ color: '#999' }}>综合评分</div>
                      </div>
                      
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="技能匹配">
                          <span style={{ fontWeight: 'bold' }}>
                            {latestEval.skillMatchScore.toFixed(0)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="经验相关">
                          <span style={{ fontWeight: 'bold' }}>
                            {latestEval.experienceScore.toFixed(0)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="教育背景">
                          <span style={{ fontWeight: 'bold' }}>
                            {latestEval.educationScore.toFixed(0)}
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  )}

                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="邮箱">{candidate.email || '-'}</Descriptions.Item>
                    <Descriptions.Item label="电话">{candidate.phone || '-'}</Descriptions.Item>
                    <Descriptions.Item label="城市">{candidate.city || '-'}</Descriptions.Item>
                  </Descriptions>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>技能标签</div>
                    {(candidate.skills || []).map((skill) => (
                      <Tag key={skill.id}>{skill.skillName}</Tag>
                    ))}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Button
                      type="primary"
                      block
                      onClick={() => {
                        setCompareModalVisible(false);
                        navigate(`/candidates/${candidate.id}`);
                      }}
                    >
                      查看详情
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Modal>
    );
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="搜索姓名、邮箱、技能"
              allowClear
              style={{ width: 300 }}
              onSearch={setSearch}
            />
            <Select
              placeholder="筛选状态"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setStatus(value || '')}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </Space>

          <Space>
            {selectedCandidates.length > 0 && (
              <Button
                type="primary"
                icon={<SwapOutlined />}
                onClick={handleCompare}
                disabled={selectedCandidates.length < 2 || selectedCandidates.length > 3}
              >
                对比 ({selectedCandidates.length})
              </Button>
            )}
            <Button
              icon={viewMode === 'table' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
              onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            >
              {viewMode === 'table' ? '卡片视图' : '表格视图'}
            </Button>
          </Space>
        </Space>

        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={data?.data.data || []}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: data?.data.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
              },
            }}
          />
        ) : (
          <>
            {renderCardView()}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Space>
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <span>
                  第 {page} 页 / 共 {Math.ceil((data?.data.total || 0) / pageSize)} 页
                </span>
                <Button
                  disabled={page >= Math.ceil((data?.data.total || 0) / pageSize)}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </Space>
            </div>
          </>
        )}
      </Card>

      {renderCompareModal()}
    </div>
  );
};
