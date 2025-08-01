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
import CommentSection from "@/components/CommentSection";

const statusLabels = {
  Pending: "Chờ duyệt",
  Submitted: "Đã gửi duyệt",
  Approved: "Đã phê duyệt",
  Rejected: "Đã từ chối",
  Published: "Đã xuất bản",
  Cancelled: "Đã hủy",
};

// Hàm lấy label tiếng Việt
const translateStatus = (status) => statusLabels[status] || status;

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
    registrationDeadline: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    capacity: "",
    registrationDeadline: "",
  });

  const [activeTab, setActiveTab] = useState("all");
  const [showCommentsFor, setShowCommentsFor] = useState({});

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

  const toggleComments = (id) => {
    setShowCommentsFor((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewActivity((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newActivity.eventDate || newActivity.eventDate <= today) {
      showAlert("Ngày sự kiện phải lớn hơn ngày hiện tại");
      return;
    }
    if (
      newActivity.registrationDeadline &&
      newActivity.registrationDeadline >= newActivity.eventDate
    ) {
      showAlert("Hạn đăng ký phải nhỏ hơn ngày sự kiện");
      return;
    }
    try {
      await api.post("/CommunicationActivities/Create-Activity", {
        title: newActivity.title,
        description: newActivity.description,
        eventDate: new Date(newActivity.eventDate).toISOString(),
        location: newActivity.location,
        capacity: Number(newActivity.capacity),
        registrationDeadline: newActivity.registrationDeadline
          ? new Date(newActivity.registrationDeadline).toISOString()
          : null,
      });
      showAlert("Tạo hoạt động thành công!");
      setNewActivity({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        capacity: "",
        registrationDeadline: "",
      });
      setShowForm(false);
      fetchActivities();
    } catch {
      showAlert("Lỗi khi tạo hoạt động");
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
      registrationDeadline: act.registrationDeadline
        ? new Date(act.registrationDeadline).toISOString().split("T")[0]
        : "",
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
      registrationDeadline: "",
    });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((p) => ({ ...p, [name]: value }));
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    if (!editData.eventDate || editData.eventDate <= today) {
      showAlert("Ngày sự kiện phải lớn hơn ngày hiện tại");
      return;
    }
    if (
      editData.registrationDeadline &&
      editData.registrationDeadline >= editData.eventDate
    ) {
      showAlert("Hạn đăng ký phải nhỏ hơn ngày sự kiện");
      return;
    }
    try {
      await api.put(`/CommunicationActivities/Update-activity/${id}`, {
        title: editData.title,
        description: editData.description,
        eventDate: new Date(editData.eventDate).toISOString(),
        location: editData.location,
        capacity: Number(editData.capacity),
        registrationDeadline: editData.registrationDeadline
          ? new Date(editData.registrationDeadline).toISOString()
          : null,
      });
      showAlert("Cập nhật thành công!");
      cancelEdit();
      fetchActivities();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        showAlert("Bạn không có quyền cập nhật hoạt động này");
      } else {
        showAlert("Lỗi khi cập nhật hoạt động");
      }
    }
  };

  const confirmDelete = (id) => {
    showConfirm("Bạn có chắc chắn muốn xóa hoạt động này?", async () => {
      try {
        await api.delete(`/CommunicationActivities/Delete-Activity/${id}`);
        fetchActivities();
        showAlert("Xóa thành công!");
      } catch (error) {
        if (error.response && error.response.status === 403) {
          showAlert("Bạn không có quyền xóa hoạt động này");
        } else {
          showAlert("Lỗi khi xóa hoạt động");
        }
      } finally {
        hideConfirm();
      }
    });
  };

  const handleSendToManager = async (id) => {
    try {
      await api.post(`/CommunicationActivities/Submit-For-Approval/${id}`);
      showAlert("Gửi duyệt thành công!");
      fetchActivities();
    } catch {
      showAlert(
        "Không thể gửi duyệt. Hoạt động có thể không ở trạng thái Pending."
      );
    }
  };

  const upcoming = activities.filter((a) => new Date(a.eventDate) > new Date());
  const filtered = upcoming.filter((act) => {
    if (activeTab === "all") return true;
    if (activeTab === "mine") return act.createdById === userId;
    if (activeTab === "pending")
      return act.createdById === userId && act.status === "Submitted";
    if (activeTab === "rejected")
      return act.createdById === userId && act.status === "Rejected";
    if (activeTab === "published") return act.status === "Published";
    if (activeTab === "cancelled") return act.status === "Cancelled";
    return true;
  });

  const getStatusClass = (s) => {
    switch (s) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Ongoing":
        return "bg-green-100 text-green-800";
      case "Published":
        return "bg-indigo-100 text-indigo-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Form thêm mới */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="mr-2" />
          {showForm ? "Đóng form" : "Thêm hoạt động mới"}
        </button>
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow border-gray-200 border">
            <form
              onSubmit={handleCreate}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Tiêu đề */}
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
              {/* Ngày sự kiện */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium">
                  Ngày sự kiện
                </label>
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
              {/* Địa điểm */}
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
              {/* Sức chứa */}
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
              {/* Hạn đăng ký */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium">Hạn đăng ký</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={newActivity.registrationDeadline}
                  onChange={handleNewChange}
                  min={today}
                  max={newActivity.eventDate || undefined}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Chọn ngày hạn đăng ký"
                />
              </div>
              {/* Mô tả */}
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
              {/* Nút Thêm */}
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
        )}

        {/* Tabs Lọc */}
        <div className="flex space-x-4">
          {[
            { key: "all", label: "Tất cả" },
            { key: "mine", label: "Của tôi" },
            { key: "pending", label: "Chờ duyệt" },
            { key: "rejected", label: "Từ chối" },
            { key: "published", label: "Đã duyệt" },
            { key: "cancelled", label: "Đã hủy" },
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
          {filtered.map((act) => {
            const canEditOrDelete =
              !act.createdById || act.createdById === userId;

            return (
              <div
                key={act.id}
                className="bg-white p-6 rounded-2xl shadow border-gray-200 border"
              >
                {editingId === act.id ? (
                  <form
                    onSubmit={(e) => handleUpdate(e, act.id)}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Form chỉnh sửa */}
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="block text-sm font-medium">
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editData.title}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="Nhập tiêu đề"
                        required
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
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
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="block text-sm font-medium">
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editData.location}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="Nhập địa điểm"
                        required
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
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
                        placeholder="Số lượng"
                        required
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="block text-sm font-medium">
                        Hạn đăng ký
                      </label>
                      <input
                        type="date"
                        name="registrationDeadline"
                        value={editData.registrationDeadline}
                        onChange={handleEditChange}
                        min={today}
                        max={editData.eventDate || undefined}
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="Chọn ngày hạn đăng ký"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="block text-sm font-medium">Mô tả</label>
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        rows="3"
                        placeholder="Mô tả chi tiết"
                        required
                      />
                    </div>
                    <div className="col-span-2 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center px-6 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition"
                      >
                        <XCircle size={18} className="mr-2" /> Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                      >
                        <CheckCircle size={18} className="mr-2" /> Cập nhật
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold">{act.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                              act.status
                            )}`}
                          >
                            {translateStatus(act.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">
                          {new Date(act.eventDate).toLocaleDateString()} —{" "}
                          {act.location} — sức chứa: {act.capacity}
                        </p>
                        {act.registrationDeadline && (
                          <p className="text-gray-600 mb-1">
                            Hạn đăng ký:{" "}
                            {new Date(
                              act.registrationDeadline
                            ).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-gray-500 mb-1">{act.description}</p>
                        {act.status === "Rejected" && act.reviewComments && (
                          <p className="text-red-600 font-medium">
                            Lý do từ chối: {act.reviewComments}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        {canEditOrDelete && (
                          <>
                            <button
                              onClick={() => startEdit(act)}
                              className="flex items-center px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
                            >
                              <Edit2 className="mr-1" /> Sửa
                            </button>
                            <button
                              onClick={() => confirmDelete(act.id)}
                              className="flex items-center px-4 py-2 bg-white border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="mr-1" /> Xóa
                            </button>
                          </>
                        )}
                        {act.createdById === userId &&
                          (act.status === "Pending" ||
                            act.status === "Rejected") && (
                            <button
                              onClick={() => handleSendToManager(act.id)}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Send className="mr-1" /> Gửi cho quản lý
                            </button>
                          )}
                      </div>
                    </div>

                    {activeTab === "published" &&
                      act.status === "Published" && (
                        <div className="mt-6">
                          <button
                            onClick={() => toggleComments(act.id)}
                            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg"
                          >
                            {showCommentsFor[act.id]
                              ? "Ẩn bình luận"
                              : "Hiển thị bình luận"}
                          </button>
                          {showCommentsFor[act.id] && (
                            <div className="mt-4 border-t pt-4">
                              <CommentSection
                                entity="activity"
                                entityId={act.id}
                              />
                            </div>
                          )}
                        </div>
                      )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Popup */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
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
