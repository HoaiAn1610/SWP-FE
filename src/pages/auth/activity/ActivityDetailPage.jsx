// src/pages/auth/activity/ActivityDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import CommentSection from "@/components/CommentSection";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const activityId = Number(id);
  const userId = Number(localStorage.getItem("id") || "0");

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [loadingPart, setLoadingPart] = useState(true);

  // Trạng thái hiển thị alert và confirm
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const hideAlert = () => setAlertVisible(false);
  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  // 1) Lấy chi tiết hoạt động
  useEffect(() => {
    setLoading(true);
    api
      .get(`/CommunicationActivities/GetById/${activityId}`)
      .then((res) => setActivity(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data || "Lỗi khi tải chi tiết hoạt động");
      })
      .finally(() => setLoading(false));
  }, [activityId]);

  // 2) Lấy danh sách tham gia
  const fetchParticipants = () => {
    setLoadingPart(true);
    api
      .get(`/ActivityParticipations/get-by-activity/${activityId}`)
      .then((res) => setParticipants(res.data))
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoadingPart(false));
  };
  useEffect(fetchParticipants, [activityId]);

  const registeredCount = participants.filter(
    (p) => p.status === "Registered"
  ).length;
  const myPart = participants.find((p) => p.memberId === userId);

  // Xử lý đăng ký với confirm
  const handleRegisterConfirm = () => {
    showConfirm("Bạn có chắc chắn muốn tham gia?", async () => {
      try {
        await api.post("/ActivityParticipations/register-activity", activityId);
        showAlert("Đăng ký thành công!");
        fetchParticipants();
      } catch (err) {
        console.error(err);
        showAlert(
          err.response?.data ||
            "Bạn cần đăng nhập mới có thể tham gia hoạt động"
        );
      }
    });
  };
  // Xử lý hủy tham gia với confirm
  const handleCancelConfirm = () => {
    showConfirm("Bạn có chắc chắn muốn hủy tham gia?", async () => {
      try {
        await api.put(`/ActivityParticipations/cancel/${activityId}`);
        showAlert("Hủy tham gia thành công!");
        fetchParticipants();
      } catch (err) {
        console.error(err);
        showAlert(err.response?.data || "Lỗi khi hủy tham gia");
      }
    });
  };

  // Chọn nút hành động phù hợp
  let actionButton = null;
  if (myPart?.status === "Registered") {
    actionButton = (
      <button
        onClick={handleCancelConfirm}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Hủy tham gia
      </button>
    );
  } else {
    const full = activity && registeredCount >= activity.capacity;
    const label = myPart?.status === "Cancelled" ? "Tham gia lại" : "Tham gia";
    actionButton = (
      <button
        onClick={handleRegisterConfirm}
        disabled={full}
        className={`px-6 py-2 rounded-lg text-white transition ${
          full
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {label}
      </button>
    );
  }

  if (loading) return <p className="text-center py-10">Đang tải chi tiết…</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!activity)
    return <p className="text-center py-10">Không tìm thấy hoạt động.</p>;

  const { title, description, eventDate, location, capacity } = activity;
  const formattedDate = new Date(eventDate).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-600 hover:underline"
        >
          ← Quay lại
        </button>

        {/* Card trắng chứa nội dung */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold">{title}</h1>

          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Thời gian:</strong> {formattedDate}
            </p>
            <p>
              <strong>Địa điểm:</strong> {location}
            </p>
            <p>
              <strong>Sức chứa:</strong> {capacity} —{" "}
              {loadingPart ? "Đang tải…" : `Đã đăng ký: ${registeredCount}`}
            </p>
          </div>

          <div className="flex items-center space-x-4">{actionButton}</div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
            <p className="text-gray-600 whitespace-pre-line">{description}</p>
          </div>

          {/* Phần bình luận */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Bình luận</h2>
            {userId ? (
              <CommentSection entity="activity" entityId={activityId} />
            ) : (
              <p className="text-gray-600">
                Bạn cần đăng nhập để xem được những bình luận này
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Popup alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <p className="mb-4 font-semibold text-indigo-800">{alertMessage}</p>
            <button
              onClick={hideAlert}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Popup confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <p className="mb-4 font-semibold text-indigo-800">
              {confirmMessage}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  hideConfirm();
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
