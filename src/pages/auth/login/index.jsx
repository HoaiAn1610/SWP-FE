// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { FaGoogle, FaGithub, FaTwitter } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../config/axios";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Login payload:", formData);
      const response = await api.post("Auth/login", {
        email: formData.email,
        password: formData.password
      });
      console.log("Full response.data:", response.data);
      const { id, email, role } = response.data;

      // Lưu token & role vào localStorage nếu cần
      localStorage.setItem("id", id);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);

      toast.success("Đăng nhập thành công!");

      // Điều hướng theo role
      if (role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Sign In"}
            </button>
          </form>

          {/* Social login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FaGoogle className="w-5 h-5" />
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FaGithub className="w-5 h-5" />
                <span className="ml-2">GitHub</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FaTwitter className="w-5 h-5" />
                <span className="ml-2">Twitter</span>
              </button>
            </div>
          </div>

          {/* Link to register */}
          <div className="text-center">
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Need an account? Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right: illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497294815431-9365093b7331"
          alt="Authentication background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
        <div className="relative z-10 flex items-center justify-center w-full p-12 text-white">
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-4">Secure Authentication</h3>
            <p className="text-xl">
              Your data is protected with industry-standard encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
