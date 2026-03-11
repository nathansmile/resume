import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../lib/api';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authApi.login(values.username, values.password);
      const { token, username } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      message.success('登录成功');
      navigate('/upload');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '28px', marginBottom: 8 }}>简历智能筛选系统</h1>
          <p style={{ color: '#999' }}>请登录以继续</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: '40px' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
          默认账号：admin / admin123
        </div>
      </Card>
    </div>
  );
};
