import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/config/axios";

export default function CourseDetailOverlay({ course, status, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [errorMaterials, setErrorMaterials] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Alert/Confirm states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // Chuyển low/medium/high sang Dễ/Trung bình/Khó
  const levelMap = {
    low: "Dễ",
    medium: "Trung bình",
    high: "Khó"
  };
  const levelKey = course.level ? course.level.toString().toLowerCase() : "";
  const levelText = levelMap[levelKey] || course.level;

  // Hiển thị nhãn cho các trạng thái
  const statusMap = {
    enrolled: "Đã tham gia",
    completed: "Hoàn thành"
  };
  const statusKey = status ? status.toString().toLowerCase() : "";
  const statusText = statusMap[statusKey] || status;

  // Hiển thị thông báo cảnh báo
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  // Hiển thị xác nhận với hành động
  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  // 1) Tải tài liệu khóa học
  useEffect(() => {
    if (!course) return;
    setLoadingMaterials(true);
    api
      .get(`/courses/${course.id}/CourseMaterial/get-materials-of-course`)
      .then((res) => setMaterials(res.data || []))
      .catch(() => {
        const msg = "Không tải được tài liệu.";
        showAlert(msg);
        setErrorMaterials(msg);
      })
      .finally(() => setLoadingMaterials(false));
  }, [course]);

  if (!course) return null;

  const userId = localStorage.getItem("id");
  const { pathname } = location;

  // 2) Xử lý nút hành động
  const handleAction = async () => {
    if (!userId) {
      showConfirm(
        "Bạn chưa đăng nhập. Chuyển đến trang Đăng nhập?",
        () => {
          onClose();
          const backUrl = `${pathname}?openOverlay=${course.id}`;
          navigate(`/login?redirect=${encodeURIComponent(backUrl)}`);
        }
      );
      return;
    }
    if (statusKey === "enrolled" || statusKey === "completed") {
      onClose();
      navigate(`/course/${course.id}/lesson`);
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/CourseEnrollment/courses/${course.id}/enroll`);
      onClose();
      navigate(`/course/${course.id}/lesson`);
    } catch (err) {
      const code = err.response?.status;
      if (code === 401 || code === 403) {
        showConfirm(
          "Bạn cần đăng nhập để bắt đầu khóa học. Chuyển đến trang Đăng nhập?",
          () => {
            onClose();
            navigate(`/login?redirect=${encodeURIComponent(pathname)}`);
          }
        );
      } else {
        showAlert(err.response?.data?.message || "Không thể ghi danh. Vui lòng thử lại sau.");
      }
    } finally {
      setProcessing(false);
    }
  };

  // Nhãn nút
  let buttonLabel = "Bắt đầu khóa học";
  if (statusKey === "enrolled") buttonLabel = "Tiếp tục khóa học";
  else if (statusKey === "completed") buttonLabel = "Xem lại khóa học";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
          <div className="p-6 space-y-4">
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-2">
              {course.level && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  Mức độ: {levelText}
                </span>
              )}
              {course.category && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Danh mục: {course.category}
                </span>
              )}
              {course.duration && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                  Thời lượng: {course.duration} phút
                </span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tài liệu khóa học</h3>
              {loadingMaterials && <p className="text-gray-500">Đang tải tài liệu...</p>}
              {!loadingMaterials && !errorMaterials && (
                <ul className="space-y-2">
                  {materials.length === 0 ? (
                    <p className="text-gray-500">Chưa có tài liệu.</p>
                  ) : (
                    materials
                      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                      .map((m) => (
                        <li key={`${m.type}-${m.title}-${m.sortOrder}`} className="border-b pb-2">
                          <p className="font-medium text-gray-800">{m.title}</p>
                          <p className="text-sm text-gray-500 mb-1">{m.type} – {m.description}</p>
                        </li>
                      ))
                  )}
                </ul>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAction}
                disabled={processing}
                className={`px-4 py-2 rounded-md text-white transition ${
                  processing ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {processing ? "Đang xử lý..." : buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup cảnh báo */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup xác nhận */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{confirmMessage}</p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setConfirmVisible(false)}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={() => { confirmAction(); hideConfirm(); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
