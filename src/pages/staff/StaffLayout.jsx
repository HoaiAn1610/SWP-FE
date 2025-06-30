import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "@/components/header";

const navItems = [
  { to: "draft-content", label: "Draft Content" },
  { to: "published-content", label: "Published Content" },
  { to: "view-blog-posts", label: "View Blog Posts" },
  { to: "inquiry-assignment", label: "Inquiry Assignment" },
];

export default function StaffLayout() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-8">Content Management</h2>
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

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </>
  );
}
