// src/pages/staff/approved-content/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios";

export default function ApprovedPage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  // Load tất cả và lọc SubmittedToManager
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

  const handleView = (courseId) => {
    navigate(`/manager/course/${courseId}`);
  };

  const handleApprove = async (courseId) => {
    if (!window.confirm("Are you sure to approve this course?")) return;
    try {
      await api.put(`/Course/${courseId}/approve`);
      alert("Course approved!");
      reloadCourses();
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Failed to approve.");
    }
  };

  const handleReject = async (courseId) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason == null) return;
    try {
      await api.put(`/Course/${courseId}/reject`, reason);
      alert("Course rejected!");
      reloadCourses();
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800">Approved Content</h1>

        {/* Empty state */}
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses awaiting approval.</p>
        ) : (
          <div className="border border-blue-500 rounded-lg p-4 space-y-4">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center py-4 border-b last:border-b-0"
              >
                {/* Course info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {c.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Level: {c.level} • Duration: {c.duration} min
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Status: {c.status}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(c.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleApprove(c.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(c.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
