import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Select, Button, Tag, Space, Card, Row, Col, Checkbox, Modal, Descriptions, Popconfirm, message } from 'antd';
import { EyeOutlined, AppstoreOutlined, UnorderedListOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import { candidatesApi } from '../lib/api';
import type { Candidate, CandidateStatus, Evaluation } from '../types';

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
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', page, pageSize, status, search, sortBy, sortOrder, skillFilter],
    queryFn: () =>
      candidatesApi.getAll({
        page,
        pageSize,
        status,
        search,
        sortBy,
        sortOrder,
        skill: skillFilter,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => candidatesApi.delete(id),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  const handleCompare = () => {
    if (selectedCandidates.length < 2 || selectedCandidates.length > 3) {
      return;
    }
    setCompareModalVisible(true);
  };

  const renderCompareModal = () => {
    const candidates = data?.data.data.filter((c: Candidate) =>
      selectedCandidates.includes(c.id)
    );

    return (
      <Modal
        title="候选人对比"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Row gutter={16}>
          {candidates?.map((candidate: Candidate) => (
            <Col span={8} key={candidate.id}>
              <Card title={candidate.name} size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="邮箱">{candidate.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="电话">{candidate.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="城市">{candidate.city || '-'}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={statusColors[candidate.status]}>
                      {statusLabels[candidate.status]}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="技能">
                    {candidate.skills?.map((skill) => (
                      <Tag key={skill.id} style={{ marginBottom: 6, marginRight: 6 }}>
                        {skill.skillName}
                      </Tag>
                    ))}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    );
  };

  const renderCardView = () => {
    return (
      <Row gutter={[16, 16]}>
        {data?.data.data.map((candidate: Candidate) => (
          <Col xs={24} sm={12} md={8} lg={6} key={candidate.id}>
            <Card
              hoverable
              actions={[
                <Checkbox
                  key="select"
                  checked={selectedCandidates.includes(candidate.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCandidates([...selectedCandidates, candidate.id]);
                    } else {
                      setSelectedCandidates(selectedCandidates.filter((id) => id !== candidate.id));
                    }
                  }}
                >
                  选择
                </Checkbox>,
                <Button
                  key="view"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  查看
                </Button>,
              ]}
            >
              <Card.Meta
                title={candidate.name}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>{candidate.email || '-'}</div>
                    <div>
                      <Tag color={statusColors[candidate.status]}>
                        {statusLabels[candidate.status]}
                      </Tag>
                    </div>
                    <div>
                      {candidate.skills?.slice(0, 3).map((skill) => (
                        <Tag key={skill.id} style={{ marginBottom: 4, marginRight: 4 }}>
                          {skill.skillName}
                        </Tag>
                      ))}
                      {candidate.skills && candidate.skills.length > 3 && (
                        <Tag>+{candidate.skills.length - 3}</Tag>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(candidate.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
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
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCandidates([...selectedCandidates, record.id]);
            } else {
              setSelectedCandidates(selectedCandidates.filter((id) => id !== record.id));
            }
          }}
        />
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      sorter: true,
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_: any, record: Candidate) => (
        <div>
          <div>{record.email || '-'}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.phone || '-'}</div>
        </div>
      ),
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      width: 250,
      render: (skills: any[]) =>
        skills && skills.length > 0 ? (
          <>
            {skills.slice(0, 3).map((skill) => (
              <Tag key={skill.id} style={{ marginBottom: 4, marginRight: 4 }}>
                {skill.skillName}
              </Tag>
            ))}
            {skills.length > 3 && <Tag>+{skills.length - 3}</Tag>}
          </>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
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
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '评分',
      dataIndex: 'evaluations',
      key: 'score',
      width: 100,
      sorter: true,
      render: (evaluations: Evaluation[]) => {
        const score = evaluations?.[0]?.overallScore;
        return score ? (
          <Tag color={score >= 80 ? 'green' : score >= 60 ? 'blue' : 'orange'}>
            {score.toFixed(1)}
          </Tag>
        ) : (
          <span style={{ color: '#999' }}>未评分</span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Candidate) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/candidates/${record.id}`)}
          >
            查看
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除该候选人吗？"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="候选人管理"
        extra={
          <Space>
            <Button
              icon={viewMode === 'table' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
              onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            >
              {viewMode === 'table' ? '卡片视图' : '表格视图'}
            </Button>
            <Button
              icon={<SwapOutlined />}
              disabled={selectedCandidates.length < 2 || selectedCandidates.length > 3}
              onClick={handleCompare}
            >
              对比候选人 ({selectedCandidates.length})
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="搜索姓名、邮箱、电话"
                onSearch={setSearch}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态筛选"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => setStatus(value || '')}
              >
                <Option value="PENDING">待筛选</Option>
                <Option value="INITIAL_PASS">初筛通过</Option>
                <Option value="INTERVIEWING">面试中</Option>
                <Option value="HIRED">已录用</Option>
                <Option value="REJECTED">已淘汰</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Input
                placeholder="技能筛选"
                allowClear
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </Col>
            {viewMode === 'card' && (
              <>
                <Col span={4}>
                  <Select
                    placeholder="排序方式"
                    style={{ width: '100%' }}
                    value={sortBy}
                    onChange={setSortBy}
                  >
                    <Option value="createdAt">上传时间</Option>
                    <Option value="name">姓名</Option>
                    <Option value="score">评分</Option>
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="排序顺序"
                    style={{ width: '100%' }}
                    value={sortOrder}
                    onChange={setSortOrder}
                  >
                    <Option value="desc">降序</Option>
                    <Option value="asc">升序</Option>
                  </Select>
                </Col>
              </>
            )}
          </Row>

          {viewMode === 'table' ? (
            <Table
              columns={columns}
              dataSource={data?.data.data || []}
              rowKey="id"
              loading={isLoading}
              onChange={(_, __, sorter) => {
                const s = sorter as { field?: string; order?: string };
                if (s.field && s.order) {
                  setSortBy(s.field);
                  setSortOrder(s.order === 'ascend' ? 'asc' : 'desc');
                } else {
                  setSortBy('createdAt');
                  setSortOrder('desc');
                }
              }}
              pagination={{
                current: page,
                pageSize,
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
        </Space>
      </Card>

      {renderCompareModal()}
    </div>
  );
};
