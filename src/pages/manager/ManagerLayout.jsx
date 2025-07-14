// src/pages/manager/ManagerLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "@/components/header";

export default function ManagerLayout() {
  const navItems = [
    { to: "overview", label: "Tổng quan" },
    { to: "approved", label: "Duyệt khóa học" },
    { to: "task-queue", label: "Duyệt Blog" },
    { to: "team-schedule", label: "Duyệt Hoạt động" },
  ];
  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50">
        {/* Thanh điều hướng bên */}
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-8">Bảng điều khiển Quản lý</h2>
            <nav className="space-y-2">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md font-medium ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Nội dung chính: Outlet sẽ hiển thị các trang con như Tổng quan, Đã duyệt, ... */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </>
  );
}
