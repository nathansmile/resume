import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { jobsApi } from '../lib/api';
import type { JobDescription } from '../types';

const { TextArea } = Input;

export const JobsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      message.success('岗位创建成功');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobsApi.update(id, data),
    onSuccess: () => {
      message.success('岗位更新成功');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsModalOpen(false);
      setEditingJob(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: () => {
      message.success('岗位删除成功');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleSubmit = (values: any) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (job: JobDescription) => {
    setEditingJob(job);
    form.setFieldsValue(job);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个岗位吗？',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>岗位管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingJob(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          创建岗位
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {isLoading ? (
          <Card loading style={{ gridColumn: '1 / -1' }} />
        ) : (jobs?.data || []).map((job: JobDescription) => (
          <Card
            key={job.id}
            size="small"
            title={<span style={{ fontSize: 14 }}>{job.title}</span>}
            extra={
              <Space size={0}>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(job)} />
                <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(job.id)} />
              </Space>
            }
          >
            <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {job.description}
            </p>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: '#666' }}>必备：</span>
              {job.requiredSkills.map((skill) => (
                <Tag key={skill} color="red" style={{ marginRight: 4, marginBottom: 4, fontSize: 11 }}>{skill}</Tag>
              ))}
            </div>
            {job.preferredSkills?.length > 0 && (
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <span style={{ color: '#666' }}>加分：</span>
                {job.preferredSkills.map((skill) => (
                  <Tag key={skill} color="blue" style={{ marginRight: 4, marginBottom: 4, fontSize: 11 }}>{skill}</Tag>
                ))}
              </div>
            )}
            <p style={{ margin: '6px 0 0', color: '#bbb', fontSize: 11 }}>
              {new Date(job.createdAt).toLocaleString('zh-CN')}
            </p>
          </Card>
        ))}
      </div>

      <Modal
        title={editingJob ? '编辑岗位' : '创建岗位'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingJob(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="岗位名称"
            rules={[{ required: true, message: '请输入岗位名称' }]}
          >
            <Input placeholder="例如：高级前端工程师" />
          </Form.Item>

          <Form.Item
            name="description"
            label="岗位描述"
            rules={[{ required: true, message: '请输入岗位描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="描述岗位职责、要求等..."
            />
          </Form.Item>

          <Form.Item
            name="requiredSkills"
            label="必备技能"
            rules={[{ required: true, message: '请输入必备技能' }]}
          >
            <Select
              mode="tags"
              placeholder="输入技能后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="preferredSkills"
            label="加分技能"
          >
            <Select
              mode="tags"
              placeholder="输入技能后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
