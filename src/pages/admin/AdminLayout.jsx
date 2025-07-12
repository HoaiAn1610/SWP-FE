// src/pages/admin/AdminLayout.jsx
import React from "react";
import { Layout, Menu } from "antd";
import Header from "@/components/header";
import {
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

const { Sider, Content } = Layout;

const menuItems = [
  {
    key: "user-management",
    icon: <UserOutlined />,
    label: "Quản lý người dùng",
  },
  {
    key: "platform-settings",
    icon: <SettingOutlined />,
    label: "Cài đặt nền tảng",
  },
  { key: "system-logs", icon: <FileTextOutlined />, label: "Nhật ký hệ thống" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Lấy phần key sau "/admin/"
  const selectedKey = pathname.split("/")[2] || "user-management";

  const onMenuClick = ({ key }) => {
    navigate(`/admin/${key}`);
  };

  return (
    <>
      <Header />
      <Layout style={{ minHeight: "100vh" }}>
        <Sider collapsedWidth={0}>
          <div
            className="logo"
            style={{
              height: 32,
              margin: 16,
              background: "rgba(255,255,255,0.3)",
            }}
          />
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={onMenuClick}
          />
        </Sider>
        <Layout>
          <Content
            style={{
              margin: "24px",
              padding: 24,
              background: "#fff",
              borderRadius: 8,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default AdminLayout;
