import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";

function AdminHeader() {
  // State to manage the dropdown's visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Ref to the dropdown container to detect clicks outside of it
  const dropdownRef = useRef(null);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    // Function to check if the click is outside the referenced element
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]); // The effect depends on the ref

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex justify-end items-center px-6 py-3">
        {/* The relative container for the dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Avatar Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none"
          >
            <FiUser size={20} className="text-gray-600" />
          </button>

          {/* Dropdown Menu - conditionally rendered */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-800">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@example.com
                </p>
              </div>
              <a
                href="#/profile"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser className="mr-3" /> My Profile
              </a>
              <a
                href="#/settings"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiSettings className="mr-3" /> Settings
              </a>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => alert("Logging out...")}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <FiLogOut className="mr-3" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
