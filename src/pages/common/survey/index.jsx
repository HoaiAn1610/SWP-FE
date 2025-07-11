// src/components/home/SurveySection.jsx
import React from "react";
import { FiFileText, FiZap, FiBarChart2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function SurveySection() {
  const navigate = useNavigate();
  const startSurvey = () => {
    // chuyển đến route survey hoặc mở modal khảo sát
    navigate("/survey");
  };

  return (
    <section
      id="survey"
      className="py-16 bg-gradient-to-r from-indigo-500 to-blue-400"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-2">
          Tham Gia Khảo Sát Phòng Ngừa
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Nhận thông tin cá nhân hóa về các yếu tố rủi ro của bạn và nhận các đề
          xuất chiến lược phòng ngừa phù hợp nhất với bạn.
        </p>
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex flex-col items-center">
            <FiFileText size={32} className="text-indigo-500 mb-2" />
            <span className="font-medium">Khảo Sát Nhanh</span>
            <span className="text-sm text-gray-500">
              Hoàn thành chỉ trong 10 phút
            </span>
          </div>
          <div className="flex flex-col items-center">
            <FiZap size={32} className="text-indigo-500 mb-2" />
            <span className="font-medium">Kết Quả Ngay</span>
            <span className="text-sm text-gray-500">
              Nhận phản hồi ngay lập tức
            </span>
          </div>
          <div className="flex flex-col items-center">
            <FiBarChart2 size={32} className="text-indigo-500 mb-2" />
            <span className="font-medium">Kế Hoạch Cá Nhân</span>
            <span className="text-sm text-gray-500">
              Đề xuất dành riêng cho bạn
            </span>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={startSurvey}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-8 py-3 rounded-full transition"
          >
            Bắt Đầu Khảo Sát Ngay
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Đảm bảo 100% bí mật và an toàn
        </p>
      </div>
    </section>
  );
}
