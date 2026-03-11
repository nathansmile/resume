import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Switch } from 'antd';
import { UploadOutlined, TeamOutlined, FileTextOutlined, LogoutOutlined, BulbOutlined, BulbFilled, RobotOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const { Header, Content, Sider, Footer } = AntLayout;

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();

  const headerBg = themeMode === 'dark'
    ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const username = localStorage.getItem('username');

  const menuItems = [
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: <Link to="/upload">上传简历</Link>,
    },
    {
      key: '/candidates',
      icon: <TeamOutlined />,
      label: <Link to="/candidates">候选人管理</Link>,
    },
    {
      key: '/jobs',
      icon: <FileTextOutlined />,
      label: <Link to="/jobs">岗位管理</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: headerBg,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '0 24px',
        height: '64px',
        lineHeight: 'normal'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            flexShrink: 0
          }}>
            <RobotOutlined style={{ fontSize: '20px', color: 'white' }} />
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', lineHeight: 1.3 }}>
              简历智能筛选系统
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', lineHeight: 1.2 }}>
              AI-Powered Resume Screening
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Switch
            checked={themeMode === 'dark'}
            onChange={toggleTheme}
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
          />
          <span style={{ color: 'white' }}>欢迎，{username}</span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            退出
          </Button>
        </div>
      </Header>
      <AntLayout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <AntLayout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: '8px',
            }}
          >
            <Outlet />
          </Content>
          <Footer style={{ textAlign: 'center', padding: '16px 0', fontSize: '12px', color: '#999' }}>
            © 2026 Resume Screening System · Developed by Nathan Jiang
          </Footer>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};
