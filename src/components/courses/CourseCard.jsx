// src/components/courses/CourseCard.jsx
import React from "react";

export default function CourseCard({ course, status, onSelect }) {
  // Bản đồ chuyển mức độ low/medium/high sang tiếng Việt thể hiện mức độ Dễ, Trung bình, Khó
  const levelMap = {
    low: "Dễ",
    medium: "Trung bình",
    high: "Khó"
  };
  const levelKey = course.level ? course.level.toString().toLowerCase() : "";
  const levelText = levelMap[levelKey] || course.level;

  // Bản đồ chuyển trạng thái Enrolled/Completed sang tiếng Việt
  const statusMap = {
    enrolled: "Đã tham gia",
    completed: "Hoàn thành"
  };
  const statusKey = status ? status.toString().toLowerCase() : "";
  const statusText = statusMap[statusKey] || status;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-2 mb-3">
          {/* Hiển thị Mức độ với nhãn Dễ/Trung bình/Khó */}
          <span className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs font-medium">
            Mức độ: {levelText}
          </span>
          {/* Hiển thị Trạng thái với nhãn Đã tham gia/Hoàn thành */}
          {status && (
            <span className="inline-block bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium">
              {statusText}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 flex-1">
          {course.description.length > 100
            ? `${course.description.slice(0, 100)}...`
            : course.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{course.duration} phút</span>
          <button
            onClick={() => onSelect(course)}
            className="px-3 py-1 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Tìm hiểu thêm →
          </button>
        </div>
      </div>
    </div>
  );
}