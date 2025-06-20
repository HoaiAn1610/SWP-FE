import React from "react";
import { Layout, Menu, Avatar, Dropdown, Space } from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Sider, Header, Content } = Layout;

const menuItems = [
  {
    key: "appointments",
    icon: <CalendarOutlined />,
    label: "Appointments",
    to: "appointments",
  },
  {
    key: "create-content",
    icon: <EditOutlined />,
    label: "Create Content",
    to: "create-content",
  },
  {
    key: "blog-qa",
    icon: <CommentOutlined />,
    label: "Blog Q&A",
    to: "blog-qa",
  },
];

export default function ConsultantLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Lấy segment cuối sau "/consultant/"
  const current = pathname.split("/")[2] || "appointments";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsedWidth={0}>
        <div
          style={{ height: 64, margin: "16px", color: "#fff", fontSize: 18 }}
        >
          PreventionHub Pro
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[current]}
          onClick={({ key }) => navigate(`/consultant/${key}`)}
          items={menuItems.map((i) => ({
            key: i.key,
            icon: i.icon,
            label: i.label,
          }))}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Avatar style={{ backgroundColor: "#7265e6" }}>SM</Avatar>
          <div style={{ color: "#fff", marginTop: 8 }}>Dr. Sarah Mitchell</div>
          <div style={{ color: "#aaa", fontSize: 12 }}>Licensed Therapist</div>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px" }}>
          {/* Bạn có thể thêm notification dropdown ở đây */}
        </Header>

        <Content style={{ margin: "24px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
