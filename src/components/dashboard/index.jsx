import React, { useState } from "react";
// --- NEW: Import Dropdown, Avatar, Space, and additional icons ---
import {
  PieChartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Dropdown, Avatar, Space } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

// Define menu items with keys matching the route path
const items = [
  getItem("Report", "dashboard", <PieChartOutlined />),
  getItem("Product", "dashboard/manage-product", <PieChartOutlined />),
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate();

  // Extract current path for menu highlighting
  const selectedKey = location.pathname.replace(/^\//, ""); // remove leading slash

  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  // --- NEW: Define the items for the dropdown menu ---
  const dropdownMenuItems = [
    {
      key: "profile",
      label: "My Profile",
      icon: <UserOutlined />,
      // Example of an action:
      // onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      // onClick: () => navigate('/dashboard/settings'),
    },
    {
      type: "divider", // This adds a horizontal line
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true, // This makes the item text red
      onClick: () => {
        // Handle your logout logic here
        console.log("User wants to log out.");
        // e.g., navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        {/* --- UPDATED HEADER SECTION --- */}
        <Header
          style={{
            padding: "0 24px", // Add horizontal padding
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end", // Align content to the right
            alignItems: "center", // Vertically center items
          }}
        >
          <Dropdown
            menu={{ items: dropdownMenuItems }}
            placement="bottomRight"
            arrow
            trigger={["click"]}
          >
            {/* This is the trigger element for the dropdown */}
            <a
              onClick={(e) => e.preventDefault()}
              style={{ cursor: "pointer" }}
            >
              <Space>
                <Avatar size="default" icon={<UserOutlined />} />
                <span style={{ color: "rgba(0, 0, 0, 0.88)" }}>Admin User</span>
              </Space>
            </a>
          </Dropdown>
        </Header>

        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "Dashboard" }]}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
