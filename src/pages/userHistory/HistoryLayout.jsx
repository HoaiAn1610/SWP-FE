import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "@/components/header";

const navItems = [
  { to: "compeleted-course", label: "Khóa học đã hoàn thành" },
  { to: "survey-history", label: "Survey đã làm" },
  { to: "activity-history", label: "Hoạt động đã tham gia" },
  { to: "appointments-history", label: "Cuộc hẹn đã thực hiện" },
  { to: "all-certificate", label: "Chứng chỉ đã nhận" },
];

export default function UserHistoryLayout() {
  return (
    <>
      <Header />
      <div>
        {/* Sidebar fixed */}
        <aside className="w-64 bg-white border-r shadow-sm fixed top-24 left-0 h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-8">Lịch Sử Hoạt Động</h2>
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

        {/* Main content with left margin */}
        <main className="ml-64 min-h-screen bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </>
  );
}
