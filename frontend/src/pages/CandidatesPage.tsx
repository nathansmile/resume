import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Select, Button, Tag, Space, Card } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
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
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', page, pageSize, status, search],
    queryFn: () => resumesApi.getAll({ page, pageSize, status, search }),
  });

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      width: 250,
      render: (skills: any[]) => (
        <>
          {skills?.slice(0, 3).map((skill) => (
            <Tag key={skill.id}>{skill.skillName}</Tag>
          ))}
          {skills?.length > 3 && <Tag>+{skills.length - 3}</Tag>}
        </>
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

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>候选人管理</h1>

      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
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
      </Card>
    </div>
  );
};
