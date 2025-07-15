// src/pages/manager/team-schedule/index.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Send } from "lucide-react";
import api from "@/config/axios";
import ActivityDetailOverlay from "./activity";

export default function TeamSchedulePage() {
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("submitted");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // state để mở overlay
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get("/CommunicationActivities/Get-All-Activities");
      setActivities(
        res.data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      );
    } catch {
      showAlert("Lỗi khi tải danh sách hoạt động");
    }
  };

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

  const handleApproveClick = (id) => {
    showConfirm("Bạn có chắc chắn muốn duyệt hoạt động này?", async () => {
      try {
        await api.post(`/CommunicationActivities/Approve/${id}`);
        showAlert("Duyệt thành công!");
        fetchActivities();
      } catch {
        showAlert("Không thể duyệt. Hoạt động phải ở trạng thái Submitted.");
      }
    });
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectReason("");
  };
  const handleRejectSubmit = async (id) => {
    if (!rejectReason.trim()) {
      showAlert("Bạn phải nhập lý do từ chối");
      return;
    }
    try {
      await api.post(`/CommunicationActivities/Reject/${id}`, null, {
        params: { reviewComments: rejectReason },
      });
      showAlert("Từ chối thành công!");
      setRejectingId(null);
      setRejectReason("");
      fetchActivities();
    } catch {
      showAlert("Không thể từ chối. Hoạt động phải ở trạng thái Submitted.");
    }
  };
  const handleRejectCancel = () => {
    setRejectingId(null);
    setRejectReason("");
  };

  const handlePublishClick = (id) => {
    showConfirm("Bạn có chắc chắn muốn công bố hoạt động này?", async () => {
      try {
        await api.post(`/CommunicationActivities/Publish/${id}`);
        showAlert("Công bố thành công!");
        fetchActivities();
      } catch {
        showAlert("Không thể công bố. Hoạt động phải ở trạng thái Approved.");
      }
    });
  };

  // mở overlay
  const handleSelect = (activity) => {
    setSelectedActivity(activity);
  };

  const submitted = activities.filter((a) => a.status === "Submitted");
  const approved = activities.filter((a) => a.status === "Approved");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Duyệt Hoạt động</h1>

      {/* Các tab */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab("submitted")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "submitted"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Đã gửi
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "approved"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Đã duyệt
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-4">
        {/* Tab Submitted */}
        {activeTab === "submitted" &&
          submitted.map((act) => (
            <div
              key={act.id}
              className="bg-white p-4 rounded-lg shadow flex flex-col"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{act.title}</h2>
                  {/* CHỈ HIỂN THỊ NGÀY */}
                  <p className="text-gray-600">
                    <strong>Ngày diễn ra:</strong>{" "}
                    {new Date(act.eventDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveClick(act.id)}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="mr-1" />
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleRejectClick(act.id)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle className="mr-1" />
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleSelect(act)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
              {rejectingId === act.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    placeholder="Nhập lý do từ chối"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRejectSubmit(act.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Gửi từ chối
                    </button>
                    <button
                      onClick={handleRejectCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* Tab Approved */}
        {activeTab === "approved" &&
          approved.map((act) => (
            <div
              key={act.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">{act.title}</h2>
                {/* CHỈ HIỂN THỊ NGÀY */}
                <p className="text-gray-600">
                  <strong>Ngày diễn ra:</strong>{" "}
                  {new Date(act.eventDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePublishClick(act.id)}
                  className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Send className="mr-1" />
                  Công bố
                </button>
                <button
                  onClick={() => handleSelect(act)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Popup cảnh báo */}
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

      {/* Popup xác nhận */}
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

      {/* Overlay chi tiết */}
      {selectedActivity && (
        <ActivityDetailOverlay
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}
