import React from "react";

export default function ActivityDetailOverlay({ activity, onClose }) {
  if (!activity) return null;

  const {
    title,
    description,
    status,
    eventDate,
    location,
    capacity,
    createdById,
    createdDate,
    registrationDeadline,
  } = activity;

  const formattedDate = new Date(eventDate).toLocaleString();
  const formattedCreated = new Date(createdDate).toLocaleString();
  const formattedDeadline = registrationDeadline
    ? new Date(registrationDeadline).toLocaleString()
    : "Không có hạn";

  // class màu cho badge status
  const getStatusClass = (s) => {
    switch (s) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Ongoing":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Nội dung chi tiết */}
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getStatusClass(
            status
          )}`}
        >
          {status}
        </span>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Thời gian:</strong> {formattedDate}
          </p>
          <p>
            <strong>Địa điểm:</strong> {location}
          </p>
          <p>
            <strong>Sức chứa:</strong> {capacity}
          </p>
          <p>
            <strong>Hạn đăng ký:</strong> {formattedDeadline}
          </p>
          <p>
            <strong>Người tạo (ID):</strong> {createdById}
          </p>
          <p>
            <strong>Ngày tạo:</strong> {formattedCreated}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-1">Mô tả</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
