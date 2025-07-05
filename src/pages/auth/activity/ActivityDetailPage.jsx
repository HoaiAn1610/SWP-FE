// src/pages/auth/activity/ActivityDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";

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
  const [errorPart, setErrorPart] = useState(null);

  // UI alert/confirm
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

  // 1) Load activity detail
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

  // 2) Load participations
  const fetchParticipants = () => {
    setLoadingPart(true);
    api
      .get(`/ActivityParticipations/get-by-activity/${activityId}`)
      .then((res) => setParticipants(res.data))
      .catch((err) => {
        console.error(err);
        setErrorPart("Lỗi khi tải số người tham gia");
      })
      .finally(() => setLoadingPart(false));
  };
  useEffect(fetchParticipants, [activityId]);

  const registeredCount = participants.filter(
    (p) => p.status === "Registered"
  ).length;
  const myPart = participants.find((p) => p.memberId === userId);

  // handlers với confirm
  const handleRegisterConfirm = () => {
    showConfirm("Bạn có chắc chắn muốn tham gia?", async () => {
      try {
        await api.post("/ActivityParticipations/register-activity", activityId);
        showAlert("Đăng ký thành công!");
        fetchParticipants();
      } catch (err) {
        console.error(err);
        showAlert(err.response?.data || "Lỗi khi đăng ký tham gia");
      }
    });
  };
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

  // chọn button phù hợp
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

  const {
    title,
    description,
    status,
    eventDate,
    location,
    capacity,
    createdDate,
  } = activity;

  const formattedEvent = new Date(eventDate).toLocaleString();
  const formattedCreated = new Date(createdDate).toLocaleString();

  const getStatusClass = (s) => {
    switch (s) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Ongoing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
              status
            )}`}
          >
            {status}
          </span>

          <div className="mt-4 space-y-2 text-gray-700">
            <p>
              <strong>Thời gian:</strong> {formattedEvent}
            </p>
            <p>
              <strong>Địa điểm:</strong> {location}
            </p>
            <p>
              <strong>Sức chứa:</strong> {capacity} &mdash;{" "}
              {loadingPart ? "Đang tải…" : `Đã đăng ký: ${registeredCount}`}
            </p>
            <p>
              <strong>Ngày tạo:</strong> {formattedCreated}
            </p>
          </div>

          <div className="mt-6 flex items-center space-x-4">{actionButton}</div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
            <p className="text-gray-600 whitespace-pre-line">{description}</p>
          </div>
        </div>
      </div>

      {/* Alert Popup */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
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

      {/* Confirm Popup */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
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
