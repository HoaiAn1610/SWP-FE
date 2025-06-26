// src/components/SurveySection.jsx
import React from "react";
import { FiZap, FiBarChart2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function SurveySection() {
  const navigate = useNavigate();

  return (
    <section
      id="survey"
      className="h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-400"
    >
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-2">Chọn hình thức khảo sát</h2>
        <p className="text-gray-600 mb-8">
          Vui lòng chọn một trong hai hình thức để bắt đầu:
        </p>

        <div className="flex justify-center space-x-6 mb-12">
          {/* Assist */}
          <button
            onClick={() => navigate("assist")}
            className="flex-1 flex flex-col items-center bg-indigo-100 hover:bg-indigo-200 p-6 rounded-xl transition"
          >
            <FiZap size={40} className="text-indigo-600 mb-2" />
            <span className="font-semibold text-indigo-800">Assist</span>
            <span className="text-sm text-gray-500">Hỗ trợ ngay lập tức</span>
          </button>

          {/* Craft */}
          <button
            onClick={() => navigate("crafft")}
            className="flex-1 flex flex-col items-center bg-yellow-100 hover:bg-yellow-200 p-6 rounded-xl transition"
          >
            <FiBarChart2 size={40} className="text-yellow-600 mb-2" />
            <span className="font-semibold text-yellow-800">Crafft</span>
            <span className="text-sm text-gray-500">Tùy chỉnh chiến lược</span>
          </button>
        </div>

        <p className="text-xs text-gray-400">100% bảo mật và an toàn</p>
      </div>
    </section>
  );
}
