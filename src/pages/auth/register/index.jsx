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
    terms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // trạng thái modal OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // trạng thái lỗi ngày sinh
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

    // === KIỂM TRA DOB ===
    if (formData.dob) {
      const today = new Date();
      const dobDate = new Date(formData.dob);
      let age = today.getFullYear() - dobDate.getFullYear();
      // điều chỉnh nếu chưa tới sinh nhật năm nay
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
      console.error("Lỗi đăng ký:", err.response);
      const errors = err.response?.data?.errors;
      // hiển thị lỗi từ server, ưu tiên lỗi DOB
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
      console.log("Xác thực email:", data);
      toast.success("Email đã được xác thực thành công!");
      setShowOtpModal(false);
      navigate("/login");
    } catch (err) {
      console.error("Lỗi xác thực OTP:", err.response);
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
        {/* Header với logo & tiêu đề */}
        <div className="px-8 py-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="PreventionHub" className="h-12 w-12 mb-2" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo Tài Khoản
          </h2>
          <p className="text-gray-500">
            Tham gia hàng nghìn người dùng đưa ra quyết định thông minh
          </p>
        </div>

        {/* Điều hướng Login/Register */}
        <div className="px-8">
          <div className="flex bg-gray-100 rounded-full overflow-hidden mb-6">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 py-2 text-gray-600 hover:text-gray-800"
            >
              Đăng Nhập
            </button>
            <button className="flex-1 py-2 bg-white text-gray-900 font-semibold">
              Đăng Ký
            </button>
          </div>
        </div>

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="px-8 space-y-5 pb-6">
          {/* Họ và tên */}
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">
              Họ và Tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Nhập họ và tên"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Ngày sinh */}
          <div>
            <label htmlFor="dob" className="block text-gray-700 mb-1">
              Ngày Sinh
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

          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 mb-1">
              Số Điện Thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Địa Chỉ Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Mật Khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Tạo mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Nhóm tuổi */}
          <div>
            <label htmlFor="ageGroup" className="block text-gray-700 mb-1">
              Nhóm Tuổi
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
                -- Chọn nhóm tuổi --
              </option>
              <option value="Học sinh">Học sinh</option>
              <option value="Sinh viên">Sinh viên</option>
              <option value="Phụ huynh">Phụ huynh</option>
              <option value="Giáo viên">Giáo viên</option>
            </select>
          </div>

          {/* Điều khoản */}
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
              Tôi đồng ý với{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Chính sách bảo mật
              </a>
            </label>
          </div>

          {/* Nút tạo tài khoản */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-br from-purple-600 to-blue-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-opacity"
          >
            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
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
                  const idToken = credentialResponse.credential;
                  const { data } = await api.post("Auth/google-login", {
                    googleToken: idToken,
                  });
                  const { id, email, role } = data;
                  localStorage.setItem("id", id);
                  localStorage.setItem("email", email);
                  localStorage.setItem("role", role);

                  toast.success("Đăng nhập Google thành công!");
                  navigate(role === "ADMIN" ? "/dashboard" : "/");
                } catch (err) {
                  console.error(err);
                  toast.error("Không thể đăng nhập với Google.");
                } finally {
                  setIsLoading(false);
                }
              }}
              onError={() => {
                toast.error("Đăng nhập Google thất bại.");
              }}
              useOneTap={false}
            />
          </div>
          <p className="text-center text-gray-600 mt-4">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-purple-600 hover:underline">
              Đăng nhập
            </Link>
          </p>
          <p className="text-center text-gray-400 text-xs mt-3">
            Tiếp tục, bạn đồng ý với cam kết về bảo mật thanh thiếu niên và giáo
            dục phòng ngừa của chúng tôi
          </p>
        </div>
      </div>

      {/* Modal nhập OTP */}
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
