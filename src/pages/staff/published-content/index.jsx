// src/pages/CommunicationActivitiesPage.jsx
import React, { useState, useEffect } from "react";
import { PlusCircle, CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";
import api from "@/config/axios";

export default function CommunicationActivitiesPage() {
  const today = new Date().toISOString().split("T")[0];

  const [activities, setActivities] = useState([]);
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

  const fetchActivities = async () => {
    try {
      const res = await api.get("/CommunicationActivities/Get-All-Activities");
      const sorted = res.data.sort(
        (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
      );
      setActivities(sorted);
    } catch (err) {
      console.error(err);
      showAlert("Lỗi khi tải danh sách hoạt động");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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
      fetchActivities();
    } catch (err) {
      console.error(err);
      showAlert(
        err.response?.status === 401
          ? "Bạn chưa đăng nhập hoặc phiên hết hạn. Vui lòng login lại."
          : "Lỗi khi tạo hoạt động"
      );
    }
  };

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
    } catch (err) {
      console.error(err);
      showAlert(
        err.response?.status === 401
          ? "Bạn chưa đăng nhập hoặc phiên hết hạn. Vui lòng login lại."
          : "Lỗi khi cập nhật hoạt động"
      );
    }
  };

  const confirmDelete = (id) => {
    showConfirm("Bạn có chắc chắn muốn xóa hoạt động này?", async () => {
      try {
        await api.delete(`/CommunicationActivities/Delete-Activity/${id}`);
        fetchActivities();
        showAlert("Xóa hoạt động thành công!");
      } catch (err) {
        console.error(err);
        showAlert(
          err.response?.status === 401
            ? "Bạn chưa đăng nhập hoặc phiên hết hạn. Vui lòng login lại."
            : "Lỗi khi xóa hoạt động"
        );
      }
    });
  };

  const upcoming = activities.filter(
    (act) => new Date(act.eventDate) > new Date()
  );
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
        {/* Form Thêm mới */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold flex items-center space-x-2 text-indigo-600">
            <PlusCircle size={24} /> <span>Thêm hoạt động mới</span>
          </h2>
          <form
            onSubmit={handleCreate}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-sm font-medium">Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={newActivity.title}
                onChange={handleNewChange}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Nhập tiêu đề"
                required
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-sm font-medium">Ngày sự kiện</label>
              <input
                type="date"
                name="eventDate"
                value={newActivity.eventDate}
                onChange={handleNewChange}
                min={today}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-sm font-medium">Địa điểm</label>
              <input
                type="text"
                name="location"
                value={newActivity.location}
                onChange={handleNewChange}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Nhập địa điểm"
                required
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-sm font-medium">Sức chứa</label>
              <input
                type="number"
                name="capacity"
                value={newActivity.capacity}
                onChange={handleNewChange}
                min="1"
                className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Số lượng"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium">Mô tả</label>
              <textarea
                name="description"
                value={newActivity.description}
                onChange={handleNewChange}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                rows="3"
                placeholder="Mô tả chi tiết"
                required
              />
            </div>
            <div className="col-span-2 text-right">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
              >
                <CheckCircle size={18} className="mr-2" /> Thêm hoạt động
              </button>
            </div>
          </form>
        </div>

        {/* Danh sách Activities */}
        <div className="space-y-6">
          {upcoming.map((act) => (
            <div
              key={act.id}
              className="bg-white shadow rounded-2xl p-6 border border-gray-200"
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
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium">Mô tả</label>
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        rows="3"
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
                      <XCircle size={18} className="mr-2" /> Hủy
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                    >
                      <CheckCircle size={18} className="mr-2" /> Lưu
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold">{act.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                          act.status
                        )}`}
                      >
                        {act.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {new Date(act.eventDate).toLocaleDateString()} &mdash;{" "}
                      {act.location} &mdash; Sức chứa: {act.capacity}
                    </p>
                    <p className="text-gray-500">{act.description}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => startEdit(act)}
                      className="inline-flex items-center px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                    >
                      <Edit2 size={16} className="mr-1" /> Sửa
                    </button>
                    <button
                      onClick={() => confirmDelete(act.id)}
                      className="inline-flex items-center px-4 py-2 bg-white border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} className="mr-1" /> Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alert Popup */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
            <p className="mb-4 text-lg text-indigo-800 font-semibold">
              {alertMessage}
            </p>
            <button
              onClick={hideAlert}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Popup */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
            <p className="mb-4 text-lg text-indigo-800 font-semibold">
              {confirmMessage}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  hideConfirm();
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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
