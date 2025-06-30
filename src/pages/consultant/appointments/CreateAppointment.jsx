// src/pages/consultant/appointments/ConsultantSchedulePage.jsx
import React, { useState, useEffect } from "react";
import api from "@/config/axios";

export default function ConsultantSchedulePage() {
  const consultantId = localStorage.getItem("id");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    id: null,
    scheduleDate: "", // "yyyy-MM-dd"
    startTime: "", // "HH:mm"
    endTime: "", // "HH:mm"
  });
  const [error, setError] = useState("");

  // ——————————————————————————————————————————————
  // Chuyển local "HH:mm" -> UTC string "HH:mm:ss" (trừ 7 giờ)
  const toUtcString = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const utcH = (h - 7 + 24) % 24;
    return `${String(utcH).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };

  // Chuyển UTC "HH:mm:ss" -> local "HH:mm" (cộng 7 giờ)
  const toLocalHHMM = (hhmmss) => {
    const [h, m] = hhmmss.split(":").map(Number);
    const localH = (h + 7) % 24;
    return `${String(localH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  // ——————————————————————————————————————————————

  // Fetch lịch, chuyển UTC->local rồi lọc future
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
      setError("Không tải được lịch.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [consultantId]);

  // Mở modal tạo mới
  const openCreate = () => {
    setError("");
    setForm({ id: null, scheduleDate: "", startTime: "", endTime: "" });
    setModalVisible(true);
  };

  // Mở modal edit, form điền luôn giờ local
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

  // Change form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Submit tạo hoặc sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { scheduleDate, startTime, endTime, id } = form;
    if (!scheduleDate || !startTime || !endTime) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    // Kiểm tra start < end ở local
    const startLocal = new Date(`${scheduleDate}T${startTime}:00`);
    const endLocal = new Date(`${scheduleDate}T${endTime}:00`);
    if (startLocal >= endLocal) {
      setError("Thời gian bắt đầu phải trước thời gian kết thúc.");
      return;
    }

    // Payload: trừ 7h cả tạo lẫn sửa
    const payload = {
      ScheduleDate: scheduleDate,
      StartTime: toUtcString(startTime),
      EndTime: toUtcString(endTime),
      ConsultantId: consultantId,
    };

    try {
      if (id) {
        // update-schedule/{id}
        await api.put(`/ConsultantSchedule/update-schedule/${id}`, {
          id,
          ...payload,
        });
      } else {
        // add-schedule
        await api.post("/ConsultantSchedule/add-schedule", payload);
      }
      setModalVisible(false);
      await fetchSchedules(); // fetch lại để hiển thị slot mới/sửa
    } catch (err) {
      console.error(err);
      setError("Lưu thất bại.");
    }
  };

  // Xóa slot
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa slot này?")) return;
    try {
      await api.delete(`/ConsultantSchedule/delete-schedule/${id}`);
      await fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại.");
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
                      onClick={() => handleDelete(s.id)}
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
    </div>
  );
}
