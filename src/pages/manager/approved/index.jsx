// src/pages/staff/approved-content/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios";

export default function ApprovedPage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  // Load tất cả khóa học rồi lọc workflowState === "SubmittedToManager"
  const reloadCourses = async () => {
    try {
      const { data } = await api.get("/Course/get-all-courses");
      const approved = data.filter(
        (c) => c.workflowState === "SubmittedToManager"
      );
      setCourses(approved);
    } catch (err) {
      console.error("Lỗi fetch courses:", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    reloadCourses();
  }, []);

  // View course
  const handleView = (courseId) => {
    navigate(`/staff/course/${courseId}`);
  };

  // Approve course
  const handleApprove = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn approve khóa học này không?")) return;
    try {
      await api.put(`/Course/${courseId}/approve`); // giả sử route này có sẵn
      alert("Đã approve khóa học!");
      reloadCourses();
    } catch (err) {
      console.error("Approve lỗi:", err);
      alert("Không approve được khóa học.");
    }
  };

  // Reject course
  const handleReject = async (courseId) => {
    const reason = window.prompt("Nhập lý do từ chối khóa học:");
    if (reason == null) return; // user bấm Cancel
    try {
      await api.put(`/Course/${courseId}/reject`, reason);
      alert("Đã từ chối khóa học!");
      reloadCourses();
    } catch (err) {
      console.error("Reject lỗi:", err);
      alert("Không từ chối được khóa học.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Approved Content</h1>

      {courses.length === 0 ? (
        <p className="text-gray-500">
          Chưa có khóa học nào được gửi lên Manager.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white p-6 rounded-lg shadow flex flex-col justify-between"
            >
              {/* View button ở trên */}
              <button
                onClick={() => handleView(c.id)}
                className="mb-4 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View
              </button>

              {/* Thông tin khóa học */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">{c.title}</h2>
                <p className="text-gray-600 text-sm">
                  Level: {c.level} • Duration: {c.duration} phút
                </p>
                <p className="text-gray-500 text-sm mt-2">Status: {c.status}</p>
              </div>

              {/* 2 nút Approve / Reject nằm dưới */}
              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => handleApprove(c.id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(c.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
