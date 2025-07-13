// src/pages/reset-password/index.jsx
import { useState } from "react";
import { MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../config/axios";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Gọi API Đặt lại mật khẩu
      // POST /Auth/reset-password với { email }
      const { data } = await api.post("Auth/reset-password", { email });
      // data có thể là thông điệp thành công từ server
      toast.success(data || "Gửi yêu cầu thành công! Vui lòng kiểm tra email.");
      // Chuyển về trang đăng nhập
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || err.message || "Lỗi không xác định";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8 space-y-6">
        {/* Tiêu đề */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
          <p className="text-gray-600 text-sm">
            Nhập email để nhận mật khẩu mới
          </p>
        </div>

        {/* Form nhập email */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Nhập địa chỉ email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Đang gửi..." : "Gửi"}
          </button>
        </form>

        {/* Link quay lại đăng nhập */}
        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-600 hover:underline text-sm">
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
