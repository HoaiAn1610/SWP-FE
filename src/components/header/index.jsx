import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Kiểm tra login + load username, role
  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      setIsLoggedIn(true);
      const storedName = localStorage.getItem("name");
      setUsername(storedName?.trim() ? storedName : "Member");
      setRole(localStorage.getItem("role") || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Link dashboard theo role
  const dashboardLink = () => {
    switch (role.toLowerCase()) {
      case "admin":
        return "/admin/user-management";
      case "manager":
        return "/manager/overview";
      case "consultant":
        return "/consultant/appointments";
      case "staff":
        return "/staff/draft-content";
      default:
        return null;
    }
  };

  // Cuộn mượt xuống phần assessment
  const handleGetStarted = () => {
    const section = document.getElementById("survey");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("survey")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10" />
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              Home
            </Link>
            <Link to="/course" className="text-gray-600 hover:text-blue-600">
              Courses
            </Link>
            <Link
              to="/appointments/book"
              className="text-gray-600 hover:text-blue-600"
            >
              Appointment
            </Link>
            <Link
              to="/activities"
              className="text-gray-600 hover:text-blue-600"
            >
              Community activities
            </Link>
            <Link to="/blog" className="text-gray-600 hover:text-blue-600">
              Blog
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Get Started */}
          <button
            onClick={handleGetStarted}
            className="hidden md:inline-block bg-gradient-to-r from-indigo-500 to-blue-400 text-white px-5 py-2 rounded-full hover:opacity-90 transition"
          >
            Get Started
          </button>

          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none ml-2 text-sm"
            />
          </div>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((o) => !o)}
                className="flex items-center p-2 rounded-full hover:bg-gray-100 transition"
              >
                <FiUser size={20} className="text-gray-700" />
                <span className="ml-2 text-gray-700 font-medium hidden md:block">
                  {username}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow border">
                  <div className="px-4 py-2 font-semibold text-gray-800">
                    Hello, {username}
                  </div>
                  {dashboardLink() && (
                    <>
                      <div className="border-t" />
                      <div className="px-4 py-2 text-xs text-gray-500 uppercase">
                        My Pages
                      </div>
                      <Link
                        to={dashboardLink()}
                        className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                      </Link>
                    </>
                  )}
                  <div className="border-t my-1" />
                  <Link
                    to="/account/MyProfilePage"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 text-sm font-semibold transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
