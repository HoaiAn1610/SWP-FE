// src/pages/manager/ManagerLayout.jsx
import React from "react";
import { Layout, Menu, Dropdown, Space, Avatar } from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

const { Header, Content, Sider } = Layout;

const tabs = [
  { key: "overview", icon: <BarChartOutlined />, label: "Overview" },
  { key: "analytics", icon: <LineChartOutlined />, label: "Analytics" },
  { key: "task-queue", icon: <UnorderedListOutlined />, label: "Task Queue" },
  { key: "team-schedule", icon: <CalendarOutlined />, label: "Team Schedule" },
];

export default function ManagerLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeKey = pathname.split("/")[2] || "overview";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsedWidth={0} theme="light">
        <div style={{ height: 64, margin: 16, fontSize: 18, fontWeight: 600 }}>
          PreventionHub Dashboard
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={({ key }) => navigate(`/manager/${key}`)}
          items={tabs.map((tab) => ({
            key: tab.key,
            icon: tab.icon,
            label: tab.label,
          }))}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Space size="middle">
            <Dropdown
              menu={{
                items: [
                  { key: "7", label: "Last 7 days" },
                  { key: "30", label: "Last 30 days" },
                ],
              }}
            >
              <a onClick={(e) => e.preventDefault()}>Last 7 days</a>
            </Dropdown>
            <Avatar style={{ backgroundColor: "#7265e6" }}>PM</Avatar>
          </Space>
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
