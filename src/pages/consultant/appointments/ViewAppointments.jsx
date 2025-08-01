import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios";

const statusLabels = {
  Pending: "Chờ duyệt",
  Confirmed: "Xác nhận",
  Starting: "Đang tiến hành",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  NoShow: "Vắng mặt",
};

const translateStatus = (status) => statusLabels[status] || status;

// Popup component
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

export default function ViewAppointments() {
  const consultantId = localStorage.getItem("id");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();

  // popup state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // format helpers
  const formatDate = (ds) => ds.split("-").reverse().join("/");
  const formatTime = (ts) => ts.slice(0, 5);

  useEffect(() => {
    (async () => {
      try {
        // 1. Lấy danh sách cuộc hẹn
        const { data: apps } = await api.get(
          `/AppointmentRequest/consultants/${consultantId}`
        );

        // 2. Với mỗi a: lấy schedule và lấy user (member) để có tên
        const withData = await Promise.all(
          apps.map(async (a) => {
            // fetch schedule
            let scheduleDate = null,
              startTime = null,
              endTime = null;
            try {
              const { data: s } = await api.get(
                `/ConsultantSchedule/get-schedule/${a.scheduleId}`
              );
              // cộng 7h nếu cần
              const startDt = new Date(`${s.scheduleDate}T${s.startTime}`);
              startDt.setHours(startDt.getHours() + 7);
              const endDt = new Date(`${s.scheduleDate}T${s.endTime}`);
              endDt.setHours(endDt.getHours() + 7);
              scheduleDate = s.scheduleDate;
              startTime = startDt.toTimeString().slice(0, 8);
              endTime = endDt.toTimeString().slice(0, 8);
            } catch {
              // nếu lỗi schedule thì bỏ qua, vẫn giữ giá trị null
            }

            // fetch member để lấy name
            let memberName = "Không rõ";
            try {
              const { data: u } = await api.get(
                `/Admin/get-user/${a.memberId}`
              );
              memberName = u.name;
            } catch {
              // nếu lỗi fetch user thì giữ "Không rõ"
            }

            return {
              ...a,
              scheduleDate,
              startTime,
              endTime,
              memberName,
            };
          })
        );

        setAppointments(withData);
      } catch (e) {
        console.error(e);
        setAlertMessage("Lỗi khi load dữ liệu");
        setAlertVisible(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [consultantId]);

  const handleConfirm = async (id) => {
    try {
      await api.put(`/AppointmentRequest/${id}/update-status`, {
        status: "Confirmed",
        cancelReason: null,
      });
      setAppointments((apps) =>
        apps.map((a) => (a.id === id ? { ...a, status: "Confirmed" } : a))
      );
    } catch {
      setAlertMessage("Xác nhận thất bại");
      setAlertVisible(true);
    }
  };

  const handleStart = async (id) => {
    try {
      // Find the appointment by id
      const appointment = appointments.find((a) => a.id === id);
      if (!appointment || !appointment.scheduleDate) {
        throw new Error("Không tìm thấy lịch hẹn hoặc ngày không hợp lệ");
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Compare scheduleDate with today
      if (appointment.scheduleDate !== today) {
        setAlertMessage(
          `Chỉ có thể bắt đầu cuộc hẹn lúc ${formatDate(
            appointment.scheduleDate
          )} • ${formatTime(appointment.startTime)}–${formatTime(
            appointment.endTime
          )}`
        );
        setAlertVisible(true);
        return;
      }

      // Proceed with starting the appointment
      await api.put(`/AppointmentRequest/${id}/update-status`, {
        status: "Starting",
        cancelReason: null,
      });
      setAppointments((apps) =>
        apps.map((a) => (a.id === id ? { ...a, status: "Starting" } : a))
      );
      navigate(`/consultant/appointments/meeting/${id}`);
    } catch (error) {
      console.error(error);
      setAlertMessage(error.message || "Không thể bắt đầu");
      setAlertVisible(true);
    }
  };

  if (loading) return <p>Loading…</p>;

  const tabs = {
    pending: {
      label: "Chờ xác nhận",
      list: appointments.filter((a) => a.status === "Pending"),
      color: "bg-yellow-100 text-yellow-800",
    },
    confirmed: {
      label: "Đã xác nhận",
      list: appointments.filter((a) => a.status === "Confirmed"),
      color: "bg-blue-100 text-blue-800",
    },
    starting: {
      label: "Đang bắt đầu",
      list: appointments.filter((a) => a.status === "Starting"),
      color: "bg-purple-100 text-purple-800",
    },
    completed: {
      label: "Hoàn thành",
      list: appointments.filter((a) => a.status === "Completed"),
      color: "bg-green-100 text-green-800",
    },
    others: {
      label: "Khác",
      list: appointments.filter((a) =>
        ["Cancelled", "NoShow"].includes(a.status)
      ),
      color: "bg-red-100 text-red-800",
    },
  };

  return (
    <div className="p-6">
      {/* Tab buttons */}
      <div className="flex space-x-4 mb-6">
        {Object.entries(tabs).map(([key, { label, list }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded ${
              activeTab === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {label} ({list.length})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {tabs[activeTab].list.map((a) => {
          const { color } = tabs[activeTab];
          return (
            <div
              key={a.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                {/* Dòng mới: hiển thị tên user */}
                <h3 className="font-semibold">Cuộc hẹn của {a.memberName}</h3>
                <p className="text-sm text-gray-600">
                  {a.scheduleDate
                    ? `${formatDate(a.scheduleDate)} • ${formatTime(
                        a.startTime
                      )}–${formatTime(a.endTime)}`
                    : "Chưa có lịch"}
                </p>
              </div>

              {/* Badge + Action */}
              <div className="flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${color} mr-2`}
                >
                  {translateStatus(a.status)}
                </span>

                {/* Các nút hành động */}
                {activeTab === "pending" && (
                  <button
                    onClick={() => handleConfirm(a.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Xác nhận
                  </button>
                )}
                {activeTab === "confirmed" && (
                  <button
                    onClick={() => handleStart(a.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    Bắt đầu
                  </button>
                )}
                {(activeTab === "starting" ||
                  activeTab === "completed" ||
                  activeTab === "others") && (
                  <button
                    onClick={() =>
                      navigate(`/consultant/appointments/meeting/${a.id}`)
                    }
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    {activeTab === "starting" ? "Tiếp tục" : "Xem"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Popup */}
      {alertVisible && (
        <AlertPopup
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      )}
    </div>
  );
}
