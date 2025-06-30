// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { MdPerson, MdEmail, MdLock, MdPhone, MdCake } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
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

  // state mới cho OTP modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // state mới cho lỗi DOB
  const [dobError, setDobError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // nếu thay đổi DOB thì xóa lỗi cũ
    if (name === "dob") {
      setDobError("");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gửi form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // === VALIDATE DOB TRƯỚC ===
    if (formData.dob) {
      const today = new Date();
      const dobDate = new Date(formData.dob);
      let age = today.getFullYear() - dobDate.getFullYear();
      // điều chỉnh nếu chưa tới ngày sinh trong năm nay
      if (
        today <
        new Date(
          dobDate.getFullYear() + age,
          dobDate.getMonth(),
          dobDate.getDate()
        )
      ) {
        age--;
      }
      if (age < 13 || age > 120) {
        setDobError("Tuổi phải từ 13 đến 120.");
        setIsLoading(false);
        return;
      }
    }

    try {
      console.log("Register payload:", formData);
      await api.post("Auth/register", formData);
      toast.success("Mã xác thực đã được gửi về email của bạn!");
      setShowOtpModal(true);
    } catch (err) {
      console.error("Registration error response:", err.response);
      console.error("Server validation payload:", err.response?.data);
      const errors = err.response?.data?.errors;
      // hiển thị lỗi từ server, ưu tiên Dob nếu có
      if (errors) {
        if (errors.Dob) {
          toast.error(errors.Dob.join(", "));
        } else {
          Object.values(errors)
            .flat()
            .forEach((msg) => toast.error(msg));
        }
      } else {
        const message =
          err.response?.data?.message || err.message || "Lỗi không xác định";
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Xác nhận OTP
  const handleConfirmOtp = async () => {
    if (!otpCode) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post("Auth/confirm-email", {
        OobCode: otpCode,
      });
      console.log("ConfirmEmail response:", data);
      toast.success("Email đã được xác thực thành công!");
      setShowOtpModal(false);
      navigate("/login");
    } catch (err) {
      console.error("Confirm OTP error:", err.response);
      const message =
        err.response?.data ||
        err.response?.data?.message ||
        err.message ||
        "Mã xác thực không hợp lệ hoặc đã hết hạn.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header với logo & title */}
        <div className="px-8 py-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="PreventionHub" className="h-12 w-12 mb-2" />
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

        {/* Form đăng ký */}
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
            {dobError && (
              <p className="text-red-500 text-sm mt-1">{dobError}</p>
            )}
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
                  const idToken = credentialResponse.credential;
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
              useOneTap={false}
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

      {/* Modal OTP */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Nhập mã xác thực
            </h3>
            <input
              type="text"
              placeholder="Mã OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={handleConfirmOtp}
              disabled={isLoading}
              className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Đang xác thực..." : "Xác thực"}
            </button>
            <button
              onClick={() => setShowOtpModal(false)}
              className="mt-3 w-full py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
