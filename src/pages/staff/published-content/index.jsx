import React, { useEffect, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function PublishedContentPage() {
  // Header giống y hệt trên
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("Member");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const id = localStorage.getItem("id");
    const name = localStorage.getItem("name");
    if (id) setUsername(name?.trim() ? name : "Member");
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/staff/published-content">
            <img src="/logo192.png" alt="Logo" className="h-10" />
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((o) => !o)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
            >
              <FiUser size={20} className="text-gray-700" />
              <span className="font-medium">{username}</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow border">
                <Link
                  to="/staff/profile"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  My Profile
                </Link>
                <div className="border-t my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white shadow p-4 space-y-2">
          <Link
            to="/staff/draft-content"
            className="block px-3 py-2 rounded hover:bg-gray-100"
          >
            Draft Content
          </Link>
          <Link
            to="/staff/published-content"
            className="block px-3 py-2 rounded hover:bg-gray-100 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            Published Content
          </Link>
          <Link
            to="/staff/view-blog-posts"
            className="block px-3 py-2 rounded hover:bg-gray-100"
          >
            View Blog Posts
          </Link>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Published Content</h1>
          {/* Ví dụ dữ liệu */}
          <div className="space-y-4">
            {[
              {
                title: "Healthy Coping Strategies",
                date: "2024-03-12",
                comments: 7,
              },
              {
                title: "Building Resilience in Teens",
                date: "2024-03-10",
                comments: 12,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-4 rounded shadow flex justify-between"
              >
                <div>
                  <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Blog Post
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">
                    {item.date}
                  </span>
                  <h2 className="mt-2 font-semibold">{item.title}</h2>
                  <div className="text-gray-500 text-sm">
                    By Lisa Rodriguez • {item.comments} comments
                  </div>
                </div>
                <div>
                  <button className="px-4 py-2 border rounded">Edit</button>
                  <Link to="#" className="ml-4 text-blue-600 hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
