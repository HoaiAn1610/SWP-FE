// src/pages/consultant/ConsultantLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "@/components/header";

const navItems = [
  { to: "published-content", label: "Nội Dung Đã Xuất Bản" },
  { to: "view-blog-posts", label: "Xem Bài Viết Blog" },
  { to: "staff-inquirie", label: "Phân Công Yêu Cầu" },
];

export default function StaffLayout() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        {/* Thanh bên */}
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-8">Quản Lý Nội Dung</h2>
            <nav className="space-y-2">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md font-medium transition-colors ${
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

        {/* Nội dung chính */}
        <main className="flex-1 bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </>
  );
}
