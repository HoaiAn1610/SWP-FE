// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../../../assets/logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const redirect = params.get("redirect"); // sẽ là "/course/3/lesson" hoặc null

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hàm điều hướng sau khi đăng nhập thành công
  const goAfterLogin = (role) => {
    if (redirect) {
      navigate(redirect, { replace: true });
    } else {
      const r = role.toLowerCase();
      if (r === "admin") navigate("/admin", { replace: true });
      else if (r === "staff") navigate("/staff", { replace: true });
      else if (r === "manager") navigate("/manager", { replace: true });
      else if (r === "consultant") navigate("/consultant", { replace: true });
      else navigate("/", { replace: true });
    }
  };

  // Xử lý thay đổi ô input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Xử lý submit form đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1) Gửi login và nhận token
      const { data: loginData } = await api.post("Auth/login", {
        email: formData.email,
        password: formData.password,
      });
      // Giả sử server trả về { token: "Bearer xxx", expires: ... }
      const token = loginData.token.split(" ")[1]; // bỏ chữ "Bearer "
      localStorage.setItem("token", token);

      // 2) Gọi aboutMe để lấy profile
      const { data: me } = await api.get("UserManagement/aboutMe");
      // me có cấu trúc { id, name, email, role, … }
      localStorage.setItem("id", me.id);
      localStorage.setItem("email", me.email);
      localStorage.setItem("role", me.role);
      localStorage.setItem("name", me.name);

      toast.success("Đăng nhập thành công!");
      // 3) Chuyển hướng theo role hoặc redirect query
      goAfterLogin(me.role);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || err.message || "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8 space-y-6">
        {/* Logo & Thương hiệu */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="PreventionHub" className="h-12 w-12 mb-2" />
          <h1 className="text-xl font-bold text-gray-900">PreventionHub</h1>
        </div>

        {/* Tiêu đề & Phụ đề */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại
          </h2>
          <p className="text-gray-600 text-sm">
            Đăng nhập để truy cập khóa học và tài nguyên phòng ngừa
          </p>
        </div>

        {/* Tabs: giữ luôn redirect khi chuyển tab */}
        <div className="bg-gray-100 rounded-lg flex overflow-hidden">
          <Link
            to={`/login${
              redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
            }`}
            className="flex-1 text-center py-2 bg-white text-blue-600 font-medium"
          >
            Đăng Nhập
          </Link>
          <Link
            to={`/register${
              redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
            }`}
            className="flex-1 text-center py-2 text-gray-500 hover:bg-white hover:text-blue-600 font-medium"
          >
            Đăng Ký
          </Link>
        </div>

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="relative">
            <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/reset" className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        {/* Hoặc tiếp tục với */}
        <div className="px-8 pb-6">
          <p className="text-center text-gray-500 mb-4">Hoặc tiếp tục với</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setIsLoading(true);
                try {
                  // 1) Gửi token Google lên backend, nhận JWT
                  const { data: loginData } = await api.post(
                    "Auth/google-login",
                    {
                      googleToken: credentialResponse.credential,
                    }
                  );

                  // 2) Lấy token và lưu
                  const bearer = loginData.token; // "Bearer abc.def.ghi"
                  const jwt = bearer.split(" ")[1]; // "abc.def.ghi"
                  localStorage.setItem("token", jwt);

                  // 3) Thiết lập header Authorization cho các request sau
                  api.defaults.headers.common["Authorization"] = bearer;

                  // 4) Nhận thông tin user
                  let user = loginData.user;
                  if (!user) {
                    const { data: me } = await api.get(
                      "UserManagement/aboutMe"
                    );
                    user = me;
                  }

                  // 5) Lưu thông tin vào localStorage
                  localStorage.setItem("id", user.id);
                  localStorage.setItem("email", user.email);
                  localStorage.setItem("role", user.role);
                  localStorage.setItem("name", user.name);

                  toast.success("Đăng nhập Google thành công!");
                  goAfterLogin(user.role);
                } catch (err) {
                  console.error(err);
                  toast.error("Không thể đăng nhập với Google.");
                } finally {
                  setIsLoading(false);
                }
              }}
              onError={() => {
                toast.error("Google Sign-In thất bại.");
              }}
              useOneTap={false}
            />
          </div>

          <p className="text-center text-gray-600 mt-4">
            Chưa có tài khoản?{" "}
            <Link
              to={`/register${
                redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
              }`}
              className="text-blue-600 font-medium hover:underline"
            >
              Đăng Ký
            </Link>
          </p>

          <p className="text-center text-gray-400 text-xs mt-3">
            Tiếp tục, bạn đồng ý với cam kết về an toàn thanh thiếu niên và giáo
            dục phòng ngừa của chúng tôi
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
