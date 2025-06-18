// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import { GoogleLogin } from "@react-oauth/google";
// (Optional) replace with your real logo path:
import logo from "../../../assets/logo.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("Auth/login", {
        email: formData.email,
        password: formData.password,
      });
      // const { id, email, role } = response.data;
      const { id, email, role } = response.data;

      localStorage.setItem("id", id);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);

      //  Gọi aboutMe để lấy name
      try {
        const { data: profile } = await api.get("UserManagement/aboutMe");
        // Giả sử profile có trường `name`
        const realName = profile.name?.trim() ? profile.name : "Member";
        localStorage.setItem("name", realName);
        console.log("Profile fetched successfully:", profile.name);
      } catch (errProfile) {
        console.error("Fetch profile lỗi:", errProfile);
        // bạn có thể toast.warn ở đây nếu muốn
      }

      toast.success("Đăng nhập thành công!");

      if (role.toLowerCase() === "admin") navigate("/adminDashboard");
      else if (role.toLowerCase() === "staff") navigate("/staffDashboard");
      else if (role.toLowerCase() === "consultant")
        navigate("/consultantDashboard");
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Lỗi không xác định";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 to-blue-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8 space-y-6">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="PreventionHub" className="h-12 w-12 mb-2" />
          <h1 className="text-xl font-bold text-gray-900">PreventionHub</h1>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 text-sm">
            Sign in to access your prevention courses and resources
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-lg flex overflow-hidden">
          <Link
            to="/login"
            className="flex-1 text-center py-2 bg-white text-blue-600 font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 text-center py-2 text-gray-500 hover:bg-white hover:text-blue-600 font-medium"
          >
            Register
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
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

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="text-center my-3">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setIsLoading(true);
              try {
                const idToken = credentialResponse.credential; // ← đây là JWT ID Token
                console.log("ID Token:", idToken);

                const { data } = await api.post("Auth/google-login", {
                  googleToken: idToken,
                });
                const { id, email, role } = data;
                localStorage.setItem("id", id);
                localStorage.setItem("email", email);
                localStorage.setItem("role", role);

                toast.success("Đăng nhập với Google thành công!");
                navigate(role === "ADMIN" ? "/dashboard" : "/");
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
            useOneTap={false} // tắt One-Tap nếu không cần
          />
        </div>

        {/* Bottom Links & Footnote */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-600 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
          <p className="text-xs text-gray-400">
            By continuing, you agree to our commitment to youth safety and
            prevention education
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
