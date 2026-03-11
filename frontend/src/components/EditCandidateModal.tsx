import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Select,
  message,
  Card,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Candidate } from '../types';

interface EditCandidateModalProps {
  open: boolean;
  onClose: () => void;
  candidate: Candidate;
  onSave: (data: any) => Promise<void>;
}

export const EditCandidateModal = ({
  open,
  onClose,
  candidate,
  onSave,
}: EditCandidateModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && candidate) {
      // Initialize form with candidate data
      form.setFieldsValue({
        basicInfo: {
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          city: candidate.city,
        },
        educations: candidate.educations?.map((edu) => ({
          school: edu.school,
          major: edu.major,
          degree: edu.degree,
          graduationDate: edu.graduationDate ? dayjs(edu.graduationDate) : null,
        })) || [],
        workExperiences: candidate.workExperiences?.map((work) => ({
          company: work.company,
          position: work.position,
          startDate: work.startDate ? dayjs(work.startDate) : null,
          endDate: work.endDate ? dayjs(work.endDate) : null,
          description: work.description,
        })) || [],
        skills: candidate.skills?.map((s) => s.skillName) || [],
        projects: candidate.projects?.map((proj) => ({
          projectName: proj.projectName,
          techStack: proj.techStack,
          role: proj.role,
          highlights: proj.highlights,
        })) || [],
      });
    }
  }, [open, candidate, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format data for API
      const formattedData = {
        basicInfo: values.basicInfo,
        educations: values.educations?.map((edu: any) => ({
          school: edu.school,
          major: edu.major,
          degree: edu.degree,
          graduationDate: edu.graduationDate ? edu.graduationDate.format('YYYY-MM') : null,
        })) || [],
        workExperiences: values.workExperiences?.map((work: any) => ({
          company: work.company,
          position: work.position,
          startDate: work.startDate ? work.startDate.format('YYYY-MM') : null,
          endDate: work.endDate ? work.endDate.format('YYYY-MM') : null,
          description: work.description,
        })) || [],
        skills: values.skills || [],
        projects: values.projects?.map((proj: any) => ({
          projectName: proj.projectName,
          techStack: Array.isArray(proj.techStack) ? proj.techStack : proj.techStack?.split(',').map((s: string) => s.trim()) || [],
          role: proj.role,
          highlights: proj.highlights,
        })) || [],
      };

      await onSave(formattedData);
      message.success('保存成功');
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('请检查表单填写');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="编辑候选人信息"
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          保存
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
          <Form.Item label="姓名" name={['basicInfo', 'name']} rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="电话" name={['basicInfo', 'phone']}>
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item label="邮箱" name={['basicInfo', 'email']}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="城市" name={['basicInfo', 'city']}>
            <Input placeholder="请输入城市" />
          </Form.Item>
        </Card>

        <Card title="教育背景" size="small" style={{ marginBottom: 16 }}>
          <Form.List name="educations">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...field} name={[field.name, 'school']} rules={[{ required: true }]}>
                      <Input placeholder="学校" style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'major']}>
                      <Input placeholder="专业" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'degree']}>
                      <Select placeholder="学历" style={{ width: 100 }}>
                        <Select.Option value="本科">本科</Select.Option>
                        <Select.Option value="硕士">硕士</Select.Option>
                        <Select.Option value="博士">博士</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'graduationDate']}>
                      <DatePicker picker="month" placeholder="毕业时间" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加教育经历
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="工作经历" size="small" style={{ marginBottom: 16 }}>
          <Form.List name="workExperiences">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <div key={field.key} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                    <Space style={{ width: '100%', marginBottom: 8 }}>
                      <Form.Item {...field} name={[field.name, 'company']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                        <Input placeholder="公司名称" style={{ width: 180 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'position']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                        <Input placeholder="职位" style={{ width: 150 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                    <Space style={{ width: '100%', marginBottom: 8 }}>
                      <Form.Item {...field} name={[field.name, 'startDate']} style={{ marginBottom: 0 }}>
                        <DatePicker picker="month" placeholder="开始时间" />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'endDate']} style={{ marginBottom: 0 }}>
                        <DatePicker picker="month" placeholder="结束时间" />
                      </Form.Item>
                    </Space>
                    <Form.Item {...field} name={[field.name, 'description']} style={{ marginBottom: 0 }}>
                      <Input.TextArea placeholder="工作内容描述" rows={2} />
                    </Form.Item>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加工作经历
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="技能标签" size="small" style={{ marginBottom: 16 }}>
          <Form.List name="skills">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...field} rules={[{ required: true }]} style={{ marginBottom: 0, flex: 1 }}>
                      <Input placeholder="技能名称" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加技能
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="项目经历" size="small">
          <Form.List name="projects">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <div key={field.key} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                    <Space style={{ width: '100%', marginBottom: 8 }}>
                      <Form.Item {...field} name={[field.name, 'projectName']} rules={[{ required: true }]} style={{ marginBottom: 0, flex: 1 }}>
                        <Input placeholder="项目名称" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                    <Form.Item {...field} name={[field.name, 'techStack']} style={{ marginBottom: 8 }}>
                      <Select mode="tags" placeholder="技术栈（可输入多个）" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'role']} style={{ marginBottom: 8 }}>
                      <Input placeholder="个人角色" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'highlights']} style={{ marginBottom: 0 }}>
                      <Input.TextArea placeholder="项目亮点" rows={2} />
                    </Form.Item>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加项目经历
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </Modal>
  );
};

