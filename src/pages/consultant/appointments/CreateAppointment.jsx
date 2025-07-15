// src/pages/consultant/appointments/ConsultantSchedulePage.jsx
import React, { useState, useEffect } from "react";
import api from "@/config/axios";

// ----- Định nghĩa 2 popup để bạn copy nguyên vẹn -----
const AlertPopup = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <p className="mb-4 font-semibold text-indigo-800">{message}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        OK
      </button>
    </div>
  </div>
);

const ConfirmPopup = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <p className="mb-4 font-semibold text-indigo-800">{message}</p>
      <div className="flex justify-center space-x-2">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);
// ----------------------------------------------------

export default function ConsultantSchedulePage() {
  const consultantId = localStorage.getItem("id");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    id: null,
    scheduleDate: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState("");

  // trạng thái cho AlertPopup
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // trạng thái cho ConfirmPopup
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  // ——————————————————————————————————————————————
  const toUtcString = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const utcH = (h - 7 + 24) % 24;
    return `${String(utcH).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };
  const toLocalHHMM = (hhmmss) => {
    const [h, m] = hhmmss.split(":").map(Number);
    const localH = (h + 7) % 24;
    return `${String(localH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  // ——————————————————————————————————————————————

  const fetchSchedules = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/ConsultantSchedule/${consultantId}`);
      const withLocal = data.map((s) => ({
        ...s,
        startTime: toLocalHHMM(s.startTime),
        endTime: toLocalHHMM(s.endTime),
      }));
      const now = Date.now();
      const filtered = withLocal.filter((s) => {
        const endLocal = new Date(`${s.scheduleDate}T${s.endTime}:00`);
        return endLocal.getTime() > now;
      });
      setSchedules(filtered);
    } catch (err) {
      console.error(err);
      setAlertMessage("Không tải được lịch.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [consultantId]);

  const openCreate = () => {
    setError("");
    setForm({ id: null, scheduleDate: "", startTime: "", endTime: "" });
    setModalVisible(true);
  };

  const openEdit = (slot) => {
    setError("");
    setForm({
      id: slot.id,
      scheduleDate: slot.scheduleDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setModalVisible(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { scheduleDate, startTime, endTime, id } = form;
    if (!scheduleDate || !startTime || !endTime) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(scheduleDate);
    if (selectedDate < today) {
      setError("Ngày khám phải là ngày hiện tại hoặc tương lai.");
      return;
    }
    const startLocal = new Date(`${scheduleDate}T${startTime}:00`);
    const endLocal = new Date(`${scheduleDate}T${endTime}:00`);
    if (startLocal >= endLocal) {
      setError("Thời gian bắt đầu phải trước thời gian kết thúc.");
      return;
    }

    const payload = {
      ScheduleDate: scheduleDate,
      StartTime: toUtcString(startTime),
      EndTime: toUtcString(endTime),
      ConsultantId: consultantId,
    };

    try {
      if (id) {
        await api.put(`/ConsultantSchedule/update-schedule/${id}`, {
          id,
          ...payload,
        });
        setAlertMessage("Cập nhật slot thành công.");
      } else {
        await api.post("/ConsultantSchedule/add-schedule", payload);
        setAlertMessage("Tạo slot mới thành công.");
      }
      setShowAlert(true);
      setModalVisible(false);
      await fetchSchedules();
    } catch (err) {
      console.error(err);
      setAlertMessage("Lưu thất bại.");
      setShowAlert(true);
    }
  };

  // Thay window.confirm bằng ConfirmPopup
  const openConfirmDelete = (id) => {
    setConfirmId(id);
    setConfirmMessage("Bạn có chắc muốn xóa slot này?");
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirm(false);
    try {
      await api.delete(`/ConsultantSchedule/delete-schedule/${confirmId}`);
      setAlertMessage("Xóa slot thành công.");
      setShowAlert(true);
      await fetchSchedules();
    } catch (err) {
      console.error(err);
      setAlertMessage("Xóa thất bại.");
      setShowAlert(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Nút tạo */}
        <button
          onClick={openCreate}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tạo Lịch Khám
        </button>

        {/* Modal Create/Edit */}
        {modalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">
                  {form.id ? "Sửa Slot" : "Tạo Slot Mới"}
                </h2>
                {error && <p className="text-red-600">{error}</p>}

                <div>
                  <label className="block text-sm">Ngày khám</label>
                  <input
                    type="date"
                    name="scheduleDate"
                    value={form.scheduleDate}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm">Giờ bắt đầu</label>
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Giờ kết thúc</label>
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalVisible(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Danh sách slot */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <p className="p-6 text-center">Loading…</p>
          ) : schedules.length === 0 ? (
            <p className="p-6 text-gray-500">Chưa có slot nào.</p>
          ) : (
            <ul>
              {schedules.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between items-center p-4 border-b"
                >
                  <div>
                    <p>
                      <span className="font-medium">Ngày:</span>{" "}
                      {new Date(s.scheduleDate).toLocaleDateString("vi-VN")}
                    </p>
                    <p>
                      <span className="font-medium">Giờ:</span> {s.startTime} –{" "}
                      {s.endTime}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openConfirmDelete(s.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Popup thông báo chung */}
      {showAlert && (
        <AlertPopup
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Popup xác nhận xóa */}
      {showConfirm && (
        <ConfirmPopup
          message={confirmMessage}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
