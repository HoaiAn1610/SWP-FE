import React from 'react';
import { FaTag } from 'react-icons/fa'; // tuỳ chọn icon

/**
 * TagTabs – Pill-style tabs với underline animation, luôn cố định khi cuộn trang
 */
export default function TagTabs({
  tabs = [],
  selectedIndex,
  onChange,
  vertical = false,
}) {
  return (
    <div
      className={`sticky top-22 bg-white z-10 p-2 rounded-lg shadow-sm
        ${vertical ? 'flex flex-col space-y-3' : 'flex space-x-3'}
      `}
    >
      {tabs.map((tab, idx) => {
        const active = idx === selectedIndex;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(idx)}
            className={`relative flex items-center px-5 py-2 font-medium transition
              ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }
            `}
          >
            {/* <FaTag className="mr-2" /> */}
            <span className="whitespace-nowrap">{tab.name}</span>
            <span
              className={`absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out
                ${active ? 'w-full left-0' : 'w-0'}
              `}
            />
          </button>
        );
      })}
    </div>
  );
}
