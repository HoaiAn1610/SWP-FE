// src/pages/staff/StaffLayout.jsx
import React from "react";
import { Layout, Menu, Avatar } from "antd";
import {
  FileOutlined,
  CheckCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: "draft-content", icon: <FileOutlined />, label: "Draft Content" },
  {
    key: "published-content",
    icon: <CheckCircleOutlined />,
    label: "Published Content",
  },
  { key: "view-blog-posts", icon: <BookOutlined />, label: "View Blog Posts" },
];

export default function StaffLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedKey = pathname.split("/")[2] || "draft-content";

  const onMenuClick = ({ key }) => {
    navigate(`/staff/${key}`);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsedWidth={0} theme="light">
        <div style={{ height: 64, margin: 16, fontSize: 18, fontWeight: 600 }}>
          Content Management Dashboard
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          items={menuItems}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Avatar size="large" style={{ backgroundColor: "#7265e6" }}>
            SJ
          </Avatar>
          <div style={{ marginTop: 8 }}>Sarah Johnson</div>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px" }}>
          {/* Có thể thêm nút Create New Content ở đây */}
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
