// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { MdPerson, MdEmail, MdLock, MdPhone, MdCake } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../../../assets/logo.png";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
    password: "",
    ageGroup: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Register payload:", formData);
      const response = await api.post("UserManagement/register", formData);
      console.log("Register response:", response.data);
      toast.success("Tạo tài khoản thành công!");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with logo & title */}
        <div className="px-8 py-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex flex-col items-center">
              <img src={logo} alt="PreventionHub" className="h-12 w-12 mb-2" />
              {/* <h1 className="text-xl font-bold text-gray-900">PreventionHub</h1> */}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-500">
            Join thousands of students making informed choices
          </p>
        </div>

        {/* Tab nav */}
        <div className="px-8">
          <div className="flex bg-gray-100 rounded-full overflow-hidden mb-6">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 py-2 text-gray-600 hover:text-gray-800"
            >
              Login
            </button>
            <button className="flex-1 py-2 bg-white text-gray-900 font-semibold">
              Register
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 space-y-5 pb-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              required
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {/* Bạn có thể thêm icon hiện/ẩn mật khẩu ở đây */}
          </div>

          {/* Age Group */}
          <div>
            <label htmlFor="ageGroup" className="block text-gray-700 mb-1">
              Age Group
            </label>
            <select
              id="ageGroup"
              name="ageGroup"
              required
              value={formData.ageGroup}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="" disabled>
                -- Select your role --
              </option>
              <option value="Student">Student</option>
              <option value="University">University</option>
              <option value="Parent">Parent</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-gray-600 text-sm">
              I agree to the{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-br from-purple-600 to-blue-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-opacity"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Or continue with */}
        <div className="px-8 pb-6">
          <p className="text-center text-gray-500 mb-4">Or continue with</p>
          <div className="flex space-x-4">
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
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-gray-400 text-xs mt-3">
            By continuing, you agree to our commitment to youth safety and
            prevention education
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
