// src/pages/CommunicationActivitiesPage.jsx
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Send,
} from "lucide-react";
import api from "@/config/axios";

export default function CommunicationActivitiesPage() {
  const today = new Date().toISOString().split("T")[0];
  const userId = Number(localStorage.getItem("id") || "0");

  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    capacity: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    capacity: "",
  });

  const [activeTab, setActiveTab] = useState("all");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

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

  // Tạo mới
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({ ...prev, [name]: value }));
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newActivity.eventDate || newActivity.eventDate <= today) {
      showAlert("Ngày sự kiện phải lớn hơn ngày hiện tại");
      return;
    }
    try {
      await api.post("/CommunicationActivities/Create-Activity", {
        ...newActivity,
        capacity: Number(newActivity.capacity),
      });
      showAlert("Tạo hoạt động thành công!");
      setNewActivity({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        capacity: "",
      });
      setShowForm(false);
      fetchActivities();
    } catch {
      showAlert("Lỗi khi tạo hoạt động");
    }
  };

  // Chỉnh sửa
  const startEdit = (act) => {
    setEditingId(act.id);
    setEditData({
      title: act.title,
      description: act.description,
      eventDate: act.eventDate.split("T")[0],
      location: act.location,
      capacity: act.capacity.toString(),
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      title: "",
      description: "",
      eventDate: "",
      location: "",
      capacity: "",
    });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  const handleUpdate = async (e, id) => {
    e.preventDefault();
    if (!editData.eventDate || editData.eventDate <= today) {
      showAlert("Ngày sự kiện phải lớn hơn ngày hiện tại");
      return;
    }
    try {
      await api.put(`/CommunicationActivities/Update-activity/${id}`, {
        ...editData,
        capacity: Number(editData.capacity),
      });
      showAlert("Cập nhật thành công!");
      cancelEdit();
      fetchActivities();
    } catch {
      showAlert("Lỗi khi cập nhật hoạt động");
    }
  };

  // Xóa
  const confirmDelete = (id) => {
    showConfirm("Bạn có chắc chắn muốn xóa hoạt động này?", async () => {
      try {
        await api.delete(`/CommunicationActivities/Delete-Activity/${id}`);
        fetchActivities();
        showAlert("Xóa thành công!");
      } catch {
        showAlert("Lỗi khi xóa hoạt động");
      } finally {
        hideConfirm();
      }
    });
  };

  // Gửi cho quản lý (Submit for approval)
  const handleSendToManager = async (id) => {
    try {
      await api.post(`/CommunicationActivities/Submit-For-Approval/${id}`);
      showAlert("Gửi duyệt thành công!");
      fetchActivities();
    } catch (err) {
      showAlert(
        err.response?.data ||
          "Không thể gửi duyệt. Hoạt động có thể không ở trạng thái Pending."
      );
    }
  };

  // Lọc upcoming và theo tab
  const upcoming = activities.filter(
    (act) => new Date(act.eventDate) > new Date()
  );
  const filtered = upcoming.filter((act) => {
    if (activeTab === "all") return true;
    if (activeTab === "mine") return act.createdById === userId;
    if (activeTab === "pending")
      return act.createdById === userId && act.status === "Pending";
    if (activeTab === "rejected")
      return act.createdById === userId && act.status === "Rejected";
    return true;
  });

  const getStatusClass = (status) => {
    switch (status) {
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
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Nút bật/tắt form */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="mr-2" />
          {showForm ? "Đóng form" : "Thêm hoạt động mới"}
        </button>

        {/* Form tạo mới */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <form
              onSubmit={handleCreate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={newActivity.title}
                  onChange={handleNewChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Ngày sự kiện
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={newActivity.eventDate}
                  onChange={handleNewChange}
                  min={today}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={newActivity.location}
                  onChange={handleNewChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Sức chứa</label>
                <input
                  type="number"
                  name="capacity"
                  value={newActivity.capacity}
                  onChange={handleNewChange}
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium">Mô tả</label>
                <textarea
                  name="description"
                  value={newActivity.description}
                  onChange={handleNewChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                  required
                />
              </div>
              <div className="md:col-span-2 text-right">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <CheckCircle className="mr-2" />
                  Gửi cho quản lý
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4">
          {[
            { key: "all", label: "Tất cả" },
            { key: "mine", label: "Của tôi" },
            { key: "pending", label: "Chờ duyệt" },
            { key: "rejected", label: "Từ chối" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Danh sách hoạt động */}
        <div className="space-y-6">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="bg-white p-6 rounded-2xl shadow border border-gray-200"
            >
              {editingId === act.id ? (
                <form
                  onSubmit={(e) => handleUpdate(e, act.id)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editData.title}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Ngày sự kiện
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={editData.eventDate}
                        onChange={handleEditChange}
                        min={today}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editData.location}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Sức chứa
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={editData.capacity}
                        onChange={handleEditChange}
                        min="1"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium">Mô tả</label>
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-200 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      <XCircle className="mr-2" />
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle className="mr-2" />
                      Lưu
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold">{act.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                          act.status
                        )}`}
                      >
                        {act.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      {new Date(act.eventDate).toLocaleDateString()} —{" "}
                      {act.location} — sức chứa: {act.capacity}
                    </p>
                    <p className="text-gray-500 mb-1">{act.description}</p>
                    {/* Nếu status = Rejected, hiển thị ReviewComments màu đỏ */}
                    {act.status === "Rejected" && act.reviewComments && (
                      <p className="text-red-600 font-medium">
                        Lý do từ chối: {act.reviewComments}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => startEdit(act)}
                      className="flex items-center px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                    >
                      <Edit2 className="mr-1" /> Sửa
                    </button>
                    <button
                      onClick={() => confirmDelete(act.id)}
                      className="flex items-center px-4 py-2 bg-white border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="mr-1" /> Xóa
                    </button>
                    {act.createdById === userId && (
                      <button
                        onClick={() => handleSendToManager(act.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Send className="mr-1" /> Gửi cho quản lý
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
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
                className="px-4 py-2 bg-gray-200 rounded-lg"
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
    </>
  );
}

// Helper for status badge styling
function getStatusClass(status) {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Ongoing":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
