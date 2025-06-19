import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    key: "user-management",
    label: "User Management",
    to: "/admin/user-management",
  },
  {
    key: "platform-settings",
    label: "Platform Settings",
    to: "/admin/platform-settings",
  },
  { key: "system-logs", label: "System Logs", to: "/admin/system-logs" },
];

const UserManagementPage = () => {
  const { pathname } = useLocation();
  const activeKey = pathname.split("/")[2] || "user-management";

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <nav className="w-48 bg-gray-100 p-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.key} className="mb-2">
              <Link
                to={item.to}
                className={`block px-3 py-2 rounded 
                   ${
                     activeKey === item.key
                       ? "bg-indigo-600 text-white"
                       : "text-gray-700 hover:bg-indigo-100"
                   }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content area */}
      <div className="flex-1 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">User Management</h1>
        {/* TODO: đưa component quản lý user vào đây */}
      </div>
    </div>
  );
};

export default UserManagementPage;
