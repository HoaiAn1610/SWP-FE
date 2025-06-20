import React, { useEffect, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function DraftContentPage() {
  // Header state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("Member");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const id = localStorage.getItem("id");
    const name = localStorage.getItem("name");
    if (id) {
      setUsername(name?.trim() ? name : "Member");
    }
  }, []);

  // đóng dropdown khi click ngoài
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
          <Link to="/staff/draft-content">
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
            className="block px-3 py-2 rounded hover:bg-gray-100 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            Draft Content
          </Link>
          <Link
            to="/staff/published-content"
            className="block px-3 py-2 rounded hover:bg-gray-100"
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
          <h1 className="text-2xl font-semibold">Draft Content</h1>
          {/* Ví dụ dữ liệu */}
          <div className="space-y-4">
            {[
              {
                title: "Understanding Teen Brain Development",
                date: "2024-03-15",
                comments: 3,
              },
              {
                title: "Handling Peer Pressure Course",
                date: "2024-03-14",
                comments: 0,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-4 rounded shadow flex justify-between"
              >
                <div>
                  <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    Blog Post
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">
                    {item.date}
                  </span>
                  <span className="ml-4 text-gray-500">Draft</span>
                  <h2 className="mt-2 font-semibold">{item.title}</h2>
                  <div className="text-gray-500 text-sm">
                    By Sarah Johnson • {item.comments} comments
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="block w-full px-4 py-2 bg-green-500 text-white rounded">
                    Send for Approval
                  </button>
                  <button className="block w-full px-4 py-2 bg-blue-600 text-white rounded">
                    Edit Draft
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
