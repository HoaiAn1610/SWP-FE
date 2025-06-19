import React, { useEffect, useRef, useState } from "react";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";
import logo from "@/assets/logo.png";


const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check login on mount
  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      setIsLoggedIn(true);
      const stored = localStorage.getItem("name");
      setUsername(stored?.trim() ? stored : "Member");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <a href="/">
            <img src={logo} alt="Logo" className="h-10" />
          </a>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-gray-600 hover:text-blue-600">Home</a>
            <a href="/course" className="text-gray-600 hover:text-blue-600">Courses</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
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
                  <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    My Profile
                  </a>
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
          ) : (
            <a
              href="/login"
              className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 text-sm font-semibold transition"
            >
              Login
            </a>
          )}


        </div>
      </div>
    </header>
  );
};

export default Header;
