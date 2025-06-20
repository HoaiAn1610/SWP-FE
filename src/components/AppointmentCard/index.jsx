import React from "react";

// props: {
//   name, initials, type, time, duration, status, statusColor, note
// }
export default function AppointmentCard({
  name,
  initials,
  type,
  time,
  duration,
  status,
  statusColor,
  note,
}) {
  return (
    <div
      className={`
        border-2 rounded-2xl p-6 flex flex-col justify-between
        hover:shadow-lg transition
      `}
      style={{ borderColor: statusColor }}
    >
      <div className="flex items-center mb-4">
        {/* Avatar */}
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold mr-4"
          style={{ backgroundColor: statusColor }}
        >
          {initials}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{type}</p>
        </div>
      </div>

      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
        style={{
          backgroundColor: `${statusColor}20`, // màu nhạt
          color: statusColor,
        }}
      >
        {status}
      </span>

      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-700 font-medium">{time}</div>
        <div className="text-sm text-gray-500">{duration}</div>
      </div>

      {note && <p className="text-sm text-gray-500">{note}</p>}
    </div>
  );
}
