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
        {/* 2. Sidebar */}
        <aside className="w-64 bg-white border-r p-6 space-y-4">
          <h2 className="text-xl font-semibold">My Account</h2>
          <nav className="space-y-2">
            <Link
              to="my-profile"
              className="block px-3 py-2 rounded hover:bg-gray-100"
            >
              My Profile
            </Link>
            <Link
              to="settings"
              className="block px-3 py-2 rounded hover:bg-gray-100"
            >
              Settings
            </Link>
            <Link
              to="security"
              className="block px-3 py-2 rounded hover:bg-gray-100"
            >
              Security
            </Link>
            {/* ... thêm các mục khác nếu cần */}
          </nav>
        </aside>

        {/* 3. Nội dung con */}
        <main className="flex-1 p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
