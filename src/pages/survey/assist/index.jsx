// src/pages/AssistPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AssistPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Assist Survey</h1>
        <p className="text-gray-700">
          Đây là phần khảo sát “Assist” – nơi bạn sẽ nhận được hỗ trợ ngay lập
          tức dựa trên câu trả lời của bạn.
        </p>
        {/* TODO: Chèn form / nội dung khảo sát Assist ở đây */}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 block mx-auto px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
}
