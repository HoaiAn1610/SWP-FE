// src/pages/consultant/ConsultantLayout.jsx
import React from "react";
import { Layout, Menu, Avatar, Dropdown, Space } from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: "appointments", icon: <CalendarOutlined />, label: "Appointments" },
  { key: "create-content", icon: <EditOutlined />, label: "Create Content" },
  {
    key: "blog-qa",
    icon: <MessageOutlined />,
    edit: "Blog Q&A",
    label: "Blog Q&A",
  },
];

const ConsultantLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Lấy phần key sau "/consultant/"
  const selectedKey = pathname.split("/")[2] || "appointments";

  const onMenuClick = ({ key }) => {
    navigate(`/consultant/${key}`);
  };

  return (
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
        <div
          style={{
            position: "absolute",
            bottom: 24,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Avatar size="large" style={{ backgroundColor: "#7265e6" }}>
            SM
          </Avatar>
          <div style={{ color: "#fff", marginTop: 8 }}>Dr. Sarah Mitchell</div>
          <div style={{ color: "#aaa", fontSize: 12 }}>Licensed Therapist</div>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px" }}>
          {/* TODO: thêm dropdown notification nếu cần */}
        </Header>
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
  );
};

export default ConsultantLayout;
