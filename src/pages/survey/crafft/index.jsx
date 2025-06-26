// src/pages/CraftPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CrafftPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Craft Survey</h1>
        <p className="text-gray-700">
          Đây là phần khảo sát “Craft” – nơi bạn có thể tùy chỉnh và cá nhân hóa
          chiến lược phòng ngừa cho riêng bạn.
        </p>
        {/* TODO: Chèn form / nội dung khảo sát Craft ở đây */}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 block mx-auto px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
}
