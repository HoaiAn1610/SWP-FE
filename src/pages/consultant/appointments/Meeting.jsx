import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/axios";

// Alert & Confirm Popups
const AlertPopup = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
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
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
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

// Format helpers
const formatDateTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const formatTime = (ts) => ts.slice(0, 5);

export default function Meeting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [notesList, setNotesList] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [updatingNote, setUpdatingNote] = useState(false);
  // popup state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  useEffect(() => {
    (async () => {
      try {
        const { data: appt } = await api.get(`/AppointmentRequest/${id}`);
        setAppointment(appt);
        const { data: sched } = await api.get(
          `/ConsultantSchedule/get-schedule/${appt.scheduleId}`
        );
        setSchedule(sched);
        const { data: user } = await api.get(
          `/Admin/get-user/${appt.memberId}`
        );
        setCustomer(user);
        const { data: notes } = await api.get(`/ConsultationNote/get-note`, {
          params: { appointmentId: appt.id },
        });
        setNotesList(notes);
      } catch (e) {
        console.error(e);
        setAlertMessage("Lỗi khi load dữ liệu");
        setAlertVisible(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // thêm
  const handleAddNote = async () => {
    const text = newNote.trim();
    if (!text) {
      setAlertMessage("Ghi chú trống");
      return setAlertVisible(true);
    }
    setSavingNote(true);
    try {
      await api.post(
        `/ConsultationNote/add-note`,
        {
          notes: text,
        },
        { params: { appointmentId: Number(id) } }
      );
      const { data } = await api.get(`/ConsultationNote/get-note`, {
        params: { appointmentId: Number(id) },
      });
      setNotesList(data);
      setNewNote("");
    } catch {
      setAlertMessage("Lưu ghi chú thất bại");
      setAlertVisible(true);
    } finally {
      setSavingNote(false);
    }
  };

  // sửa
  const handleUpdateNote = (noteId) => {
    const text = editingText.trim();
    if (!text) {
      setAlertMessage("Ghi chú trống");
      return setAlertVisible(true);
    }
    setUpdatingNote(true);
    api
      .put(`/ConsultationNote/update-note/${noteId}`, { notes: text })
      .then(async () => {
        const { data } = await api.get(`/ConsultationNote/get-note`, {
          params: { appointmentId: Number(id) },
        });
        setNotesList(data);
        setEditingNoteId(null);
        setEditingText("");
      })
      .catch(() => {
        setAlertMessage("Cập nhật ghi chú thất bại");
        setAlertVisible(true);
      })
      .finally(() => setUpdatingNote(false));
  };

  // NoShow
  const handleNoShow = () => {
    setConfirmMessage("Xác nhận đánh dấu khách hàng không có mặt?");
    setConfirmAction(async () => {
      try {
        const reason = prompt("Nhập lý do:");
        if (!reason) throw new Error();
        await api.put(`/AppointmentRequest/${id}/noshow`, { reason });
        await api.put(`/AppointmentRequest/${id}/update-status`, {
          status: "NoShow",
          cancelReason: reason,
        });
        navigate("/consultant/appointments");
      } catch {
        setAlertMessage("Cập nhật No-Show thất bại");
        setAlertVisible(true);
      }
    });
    setConfirmVisible(true);
  };

  // Complete
  const handleComplete = () => {
    setConfirmMessage("Xác nhận hoàn thành cuộc hẹn?");
    setConfirmAction(async () => {
      try {
        await api.put(`/AppointmentRequest/${id}/update-status`, {
          status: "Completed",
          cancelReason: null,
        });
        navigate("/consultant/appointments");
      } catch {
        setAlertMessage("Hoàn thành thất bại");
        setAlertVisible(true);
      }
    });
    setConfirmVisible(true);
  };

  if (loading) return <p>Loading…</p>;
  if (!appointment) return <p>Không tìm thấy cuộc hẹn</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">
        Chi tiết cuộc hẹn #{appointment.id}
      </h1>

      {/* Thông tin cuộc hẹn */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Thông tin cuộc hẹn</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Trạng thái</p>
            <p className="text-lg font-medium">{appointment.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày tạo</p>
            <p className="text-lg">
              {new Date(appointment.createdDate).toLocaleString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Số lần không tham gia</p>
            <p className="text-lg">{appointment.noShowCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày/giờ hẹn</p>
            {schedule ? (
              <p className="text-lg">
                {formatDateTime(schedule.scheduleDate + "T00:00:00")} —{` `}
                {formatTime(schedule.startTime)} đến{" "}
                {formatTime(schedule.endTime)}
              </p>
            ) : (
              <p className="text-lg italic text-gray-600">Chưa có lịch</p>
            )}
          </div>
          {appointment.cancelReason && (
            <div>
              <p className="text-sm text-gray-500">Lý do hủy</p>
              <p className="text-lg text-red-600">{appointment.cancelReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin khách hàng */}
      {customer && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Thông tin khách hàng</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Họ và tên</p>
              <p className="text-lg">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Điện thoại</p>
              <p className="text-lg">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nhóm tuổi</p>
              <p className="text-lg">{customer.ageGroup}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email đã xác thực</p>
              <p className="text-lg">
                {customer.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
              <p className="text-lg">{formatDateTime(customer.createdDate)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lịch sử ghi chú */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Lịch sử ghi chú</h2>
        {notesList.length === 0 ? (
          <p className="italic text-gray-600">Chưa có ghi chú nào</p>
        ) : (
          notesList.map((n) => (
            <div key={n.id} className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="text-sm text-gray-500">
                {formatDateTime(n.createdDate)}
              </p>
              {editingNoteId === n.id ? (
                <>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded p-2"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <button
                    onClick={() => handleUpdateNote(n.id)}
                    disabled={updatingNote}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    {updatingNote ? "Đang lưu…" : "Lưu"}
                  </button>
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <div className="flex justify-between items-start">
                  <p className="text-lg flex-1">{n.notes}</p>
                  {appointment.status === "Starting" && (
                    <button
                      onClick={() => {
                        setEditingNoteId(n.id);
                        setEditingText(n.notes);
                      }}
                      className="ml-4 text-indigo-600"
                    >
                      Sửa
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Thêm ghi chú mới */}
      {appointment.status === "Starting" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Thêm ghi chú</h2>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Nhập ghi chú..."
            disabled={savingNote}
          />
          <button
            onClick={handleAddNote}
            disabled={savingNote}
            className={`mt-4 px-6 py-2 rounded ${
              savingNote
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {savingNote ? "Đang lưu…" : "Thêm ghi chú"}
          </button>
        </div>
      )}

      {/* No-Show & Complete */}
      {appointment.status === "Starting" && (
        <div className="flex space-x-4">
          <button
            onClick={handleNoShow}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Khách hàng không có mặt
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Hoàn thành cuộc hẹn
          </button>
        </div>
      )}

      {/* Trở về */}
      {appointment.status !== "Starting" && (
        <button
          onClick={() => navigate("/consultant/appointments")}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Trở về
        </button>
      )}

      {/* Popups */}
      {alertVisible && (
        <AlertPopup
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      )}
      {confirmVisible && (
        <ConfirmPopup
          message={confirmMessage}
          onCancel={() => setConfirmVisible(false)}
          onConfirm={() => {
            setConfirmVisible(false);
            confirmAction();
          }}
        />
      )}
    </div>
  );
}
