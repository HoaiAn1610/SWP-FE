// src/pages/staff/approved-content/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios";

export default function ApprovedPage() {
  const navigate = useNavigate();

  // dữ liệu khóa học
  const [courses, setCourses] = useState([]);

  // tab đang chọn: "pending" | "approved"
  const [activeTab, setActiveTab] = useState("pending");

  // Alert & Confirm popup
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // Modal nhập lý do từ chối
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal lên lịch xuất bản
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [currentPublishId, setCurrentPublishId] = useState(null);
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");

  // tải lại dữ liệu
  const reloadCourses = async () => {
    try {
      const { data } = await api.get("/Course/get-all-courses");
      setCourses(data);
    } catch (err) {
      console.error(err);
      setCourses([]);
    }
  };
  useEffect(() => {
    reloadCourses();
  }, []);

  // hiển thị popup
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };

  // ===== Các xử lý =====
  const handleView = (id) => navigate(`/manager/course/${id}`);

  // Phê duyệt
  const handleApprove = (id) => {
    showConfirm("Bạn có chắc muốn phê duyệt khóa học này?", async () => {
      try {
        await api.put(`/Course/${id}/approve`);
        showAlert("Phê duyệt thành công!");
        reloadCourses();
      } catch {
        showAlert("Phê duyệt thất bại.");
      }
    });
  };

  // Từ chối: mở modal nhập lý do
  const handleRejectClick = (id) => {
    setCurrentRejectId(id);
    setRejectReason("");
    setRejectModalVisible(true);
  };
  const submitReject = async () => {
    try {
      await api.put(`/Course/${currentRejectId}/reject`, rejectReason);
      showAlert("Từ chối thành công!");
      reloadCourses();
    } catch {
      showAlert("Từ chối thất bại.");
    } finally {
      setRejectModalVisible(false);
    }
  };

  // Xuất bản ngay
  const handlePublish = (id) => {
    showConfirm("Bạn có chắc muốn xuất bản ngay khóa học này?", async () => {
      try {
        await api.post(`/Course/${id}/published`);
        showAlert("Xuất bản thành công!");
        reloadCourses();
      } catch {
        showAlert("Xuất bản thất bại.");
      }
    });
  };

  // Lên lịch xuất bản: gọi API schedule-publish
  const handleScheduleClick = (id) => {
    setCurrentPublishId(id);
    setPublishDate("");
    setPublishTime("");
    setScheduleModalVisible(true);
  };
  const submitSchedule = async () => {
    const dt = new Date(`${publishDate}T${publishTime}`);
    if (isNaN(dt)) {
      showAlert("Ngày giờ không hợp lệ!");
      return;
    }
    // gửi lên API
    try {
      await api.put(`/Course/${currentPublishId}/schedule-publish`, {
        publishAt: dt.toISOString(),
      });
      showAlert(`Đã lên lịch xuất bản vào ${publishDate} ${publishTime}!`);
      reloadCourses();
    } catch (err) {
      console.error(err);
      showAlert("Lên lịch thất bại.");
    } finally {
      setScheduleModalVisible(false);
    }
  };

  // danh sách lọc theo tab
  const pendingList = courses.filter(
    (c) => c.workflowState === "SubmittedToManager"
  );
  const approvedList = courses.filter((c) => c.status === "Approved");

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Quản lý nội dung</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded ${
              activeTab === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Chờ duyệt ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded ${
              activeTab === "approved"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Đã duyệt ({approvedList.length})
          </button>
        </div>

        {/* Nội dung tab “Chờ duyệt” */}
        {activeTab === "pending" &&
          (pendingList.length === 0 ? (
            <p className="text-gray-500">Không có khóa học chờ duyệt.</p>
          ) : (
            pendingList.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 mb-4 rounded shadow flex justify-between"
              >
                <div>
                  <h2 className="font-semibold">{c.title}</h2>
                  <p className="text-sm text-gray-600">
                    Mức độ: {c.level} • {c.duration} phút
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái: {c.status}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(c.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => handleApprove(c.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => handleRejectClick(c.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))
          ))}

        {/* Nội dung tab “Đã duyệt” */}
        {activeTab === "approved" &&
          (approvedList.length === 0 ? (
            <p className="text-gray-500">Không có khóa học đã duyệt.</p>
          ) : (
            approvedList.map((c) => (
              <div
                key={c.id}
                className="bg-white p-4 mb-4 rounded shadow flex justify-between"
              >
                <div>
                  <h2 className="font-semibold">{c.title}</h2>
                  <p className="text-sm text-gray-600">
                    Mức độ: {c.level} • {c.duration} phút
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái: {c.status}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePublish(c.id)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                  >
                    Xuất bản
                  </button>
                  <button
                    onClick={() => handleScheduleClick(c.id)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Lên lịch
                  </button>
                </div>
              </div>
            ))
          ))}
      </main>

      {/* Alert Popup */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4 font-semibold text-indigo-800">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Popup */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4 font-semibold text-indigo-800">
              {confirmMessage}
            </p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setConfirmVisible(false)}
                className="px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setConfirmVisible(false);
                  confirmAction();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập lý do từ chối */}
      {rejectModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl mb-3">Nhập lý do từ chối</h3>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectModalVisible(false)}
                className="px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={submitReject}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lên lịch xuất bản */}
      {scheduleModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl mb-3">Chọn ngày giờ xuất bản</h3>
            <input
              type="date"
              className="w-full p-2 border rounded mb-3"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
            <input
              type="time"
              className="w-full p-2 border rounded mb-4"
              value={publishTime}
              onChange={(e) => setPublishTime(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setScheduleModalVisible(false)}
                className="px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={submitSchedule}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Lên lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
