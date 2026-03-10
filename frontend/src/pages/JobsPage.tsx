import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  List,
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

      <List
        loading={isLoading}
        dataSource={jobs?.data || []}
        renderItem={(job: JobDescription) => (
          <Card
            key={job.id}
            style={{ marginBottom: 16 }}
            title={job.title}
            extra={
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(job)}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(job.id)}
                >
                  删除
                </Button>
              </Space>
            }
          >
            <p>{job.description}</p>
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>必备技能：</strong>
                {job.requiredSkills.map((skill) => (
                  <Tag key={skill} color="red">
                    {skill}
                  </Tag>
                ))}
              </div>
              <div>
                <strong>加分技能：</strong>
                {job.preferredSkills.map((skill) => (
                  <Tag key={skill} color="blue">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
            <p style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
              创建时间: {new Date(job.createdAt).toLocaleString('zh-CN')}
            </p>
          </Card>
        )}
      />

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
