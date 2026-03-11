import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button } from 'antd';
import { UploadOutlined, TeamOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          简历智能筛选系统
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
        <Sider width={200} style={{ background: '#fff' }}>
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
              background: '#fff',
              borderRadius: '8px',
            }}
          >
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};
