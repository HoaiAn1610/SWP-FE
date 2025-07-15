// src/pages/manager/team-schedule/index.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Send, Trash2 } from "lucide-react";
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

  // Hàm mới: xóa activity đã publish
  const handleDeleteClick = (id) => {
    showConfirm("Bạn có chắc chắn muốn xóa hoạt động này?", async () => {
      try {
        await api.delete(`/CommunicationActivities/Delete-Activity/${id}`);
        showAlert("Xóa thành công!");
        fetchActivities();
      } catch {
        showAlert("Không thể xóa. Hoạt động phải ở trạng thái Published.");
      }
    });
  };

  // mở overlay
  const handleSelect = (activity) => {
    setSelectedActivity(activity);
  };

  // lọc theo status
  const submitted = activities.filter((a) => a.status === "Submitted");
  const approved = activities.filter((a) => a.status === "Approved");
  const rejected = activities.filter((a) => a.status === "Rejected");
  const published = activities.filter((a) => a.status === "Published");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Duyệt Hoạt động</h1>

      {/* Tabs */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab("submitted")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "submitted"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Đã gửi ({submitted.length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "approved"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Đã duyệt ({approved.length})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "rejected"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Từ chối ({rejected.length})
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "published"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Đã công bố ({published.length})
        </button>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-4">
        {/* Tab Submitted */}
        {activeTab === "submitted" &&
          (submitted.length === 0 ? (
            <p className="text-gray-500">Không có hoạt động nào.</p>
          ) : (
            submitted.map((act) => (
              <div
                key={act.id}
                className="bg-white p-4 rounded-lg shadow flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{act.title}</h2>
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
            ))
          ))}

        {/* Tab Approved */}
        {activeTab === "approved" &&
          (approved.length === 0 ? (
            <p className="text-gray-500">Không có hoạt động đã duyệt.</p>
          ) : (
            approved.map((act) => (
              <div
                key={act.id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">{act.title}</h2>
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
            ))
          ))}

        {/* Tab Rejected */}
        {activeTab === "rejected" &&
          (rejected.length === 0 ? (
            <p className="text-gray-500">Không có hoạt động bị từ chối.</p>
          ) : (
            rejected.map((act) => (
              <div
                key={act.id}
                className="bg-white p-4 mb-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">{act.title}</h2>
                  <p className="text-gray-600">
                    <strong>Ngày:</strong>{" "}
                    {new Date(act.eventDate).toLocaleDateString()}
                  </p>
                  {act.reviewComments && (
                    <p className="text-sm text-red-600">
                      Lý do từ chối: {act.reviewComments}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleSelect(act)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Xem chi tiết
                </button>
              </div>
            ))
          ))}

        {/* Tab Published */}
        {activeTab === "published" &&
          (published.length === 0 ? (
            <p className="text-gray-500">Không có hoạt động đã công bố.</p>
          ) : (
            published.map((act) => (
              <div
                key={act.id}
                className="bg-white p-4 mb-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">{act.title}</h2>
                  <p className="text-gray-600">
                    <strong>Ngày diễn ra:</strong>{" "}
                    {new Date(act.eventDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSelect(act)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleDeleteClick(act.id)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 className="mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            ))
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
