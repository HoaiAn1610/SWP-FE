// src/pages/manager/team-schedule/activity.jsx
import React, { useState, useEffect } from "react";
import api from "@/config/axios";

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
  } = activity;

  // State lưu thông tin người tạo
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await api.get(`/Admin/get-user/${createdById}`);
        setCreator(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
      }
    };
    if (createdById) {
      fetchCreator();
    }
  }, [createdById]);

  // Chỉ lấy phần date, bỏ time
  const ed = new Date(eventDate);
  const eventDateOnly = `${ed.getDate()}/${
    ed.getMonth() + 1
  }/${ed.getFullYear()}`;

  const cd = new Date(createdDate);
  const createdDateOnly = `${cd.getDate()}/${
    cd.getMonth() + 1
  }/${cd.getFullYear()}`;

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
    <div
      className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Tiêu đề + badge */}
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getStatusClass(
            status
          )}`}
        >
          {status}
        </span>

        {/* Thông tin chi tiết */}
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Ngày diễn ra:</strong> {eventDateOnly}
          </p>
          <p>
            <strong>Địa điểm:</strong> {location}
          </p>
          <p>
            <strong>Sức chứa:</strong> {capacity}
          </p>
          <p>
            <strong>Người tạo:</strong> {creator?.name ?? `ID: ${createdById}`}
          </p>
          <p>
            <strong>Ngày tạo:</strong> {createdDateOnly}
          </p>
        </div>

        {/* Mô tả */}
        <div className="mt-4">
          <h3 className="font-semibold mb-1">Mô tả</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
