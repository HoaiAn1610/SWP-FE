import React from "react";

export default function ActivityCard({ activity, onSelect }) {
  const { id, title, description, status, eventDate, location, capacity } =
    activity;
  const formattedDate = new Date(eventDate).toLocaleDateString();

  const getStatusClass = (s) => {
    switch (s) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Ongoing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-2 mb-3">
          <span
            className={`inline-block ${getStatusClass(
              status
            )} rounded-full px-2 py-1 text-xs font-medium`}
          >
            {status}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 flex-1">
          {description.length > 100
            ? `${description.slice(0, 100)}...`
            : description}
        </p>
        <p className="text-sm text-gray-500 mt-2">Ngày: {formattedDate}</p>
        <p className="text-sm text-gray-500">Địa điểm: {location}</p>
        <p className="text-sm text-gray-500">Sức chứa: {capacity}</p>
        <button
          onClick={() => onSelect(activity)}
          className="mt-4 px-3 py-1 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Xem chi tiết →
        </button>
      </div>
    </div>
  );
}
