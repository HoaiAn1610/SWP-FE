// src/pages/personal-information/PersonalInfoLayout.jsx
import React from "react";
import Header from "@/components/Header";
import { Outlet, Link } from "react-router-dom";

export default function PersonalInfoLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Header chung */}
      <Header />

      <div className="flex flex-1">
        {/* 2. Thanh bên */}
        <aside className="w-64 bg-white border-r p-6 space-y-4">
          <h2 className="text-xl font-semibold">Tài khoản của tôi</h2>
          <nav className="space-y-2">
            <Link
              to="my-profile"
              className="block px-3 py-2 rounded hover:bg-gray-100"
            >
              Hồ sơ của tôi
            </Link>

            <Link
              to="security"
              className="block px-3 py-2 rounded hover:bg-gray-100"
            >
              Bảo mật
            </Link>
            <Link
              to="settings"
              className="block px-3 py-2 rounded hover:bg-gray-100"
            >
              Cài đặt
            </Link>
            {/* ... thêm các mục khác nếu cần */}
          </nav>
        </aside>

        {/* 3. Nội dung chính */}
        <main className="flex-1 p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
