import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu } from 'antd';
import { UploadOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;

export const Layout: React.FC = () => {
  const location = useLocation();

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
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          简历智能筛选系统
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
