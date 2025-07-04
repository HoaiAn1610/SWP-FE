// src/components/blog/TagTabs.jsx
import React from 'react';
import { FaTag } from 'react-icons/fa'; // chỉ nếu bạn muốn hiển thị icon phía trước

/**
 * TagTabs – Pill-style tabs với underline animation
 */
export default function TagTabs({
  tabs = [],
  selectedIndex,
  onChange,
  vertical = false,
}) {
  return (
    <div
      className={`
        ${vertical ? 'flex flex-col space-y-3' : 'flex space-x-3 overflow-x-auto'}
        bg-white p-2 rounded-lg shadow-sm
      `}
    >
      {tabs.map((tab, idx) => {
        const active = idx === selectedIndex;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(idx)}
            className={`
              relative flex items-center px-5 py-2 font-medium transition
              ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }
            `}
          >
            {/* Icon (tuỳ chọn) */}
            {/* <FaTag className="mr-2" /> */}

            <span className="whitespace-nowrap">{tab.name}</span>

            {/* Underline pill */}
            <span
              className={`
                absolute bottom-0 left-1/2 h-0.5 w-0
                bg-blue-600 transition-all duration-300 ease-in-out
                ${active ? 'w-3/4 left-1/8' : 'w-0'}
              `}
            />
          </button>
        );
      })}
    </div>
  );
}
