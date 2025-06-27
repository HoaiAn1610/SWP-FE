// src/pages/consultant/appointments/ViewAppointments.jsx
import React, { useEffect, useState } from "react";
import api from "@/config/axios";

export default function ViewAppointments() {
  const consultantId = localStorage.getItem("id"); // lấy từ token sau khi login
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending | confirmed | completed | others

  // Hàm format ngày DD/MM/YYYY
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    const dd = day.padStart(2, "0");
    const mm = month.padStart(2, "0");
    return `${dd}/${mm}/${year}`;
  };

  // Hàm format giờ HH:mm (bỏ phần giây nếu có)
  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const hh = hour.padStart(2, "0");
    const mm = minute.padStart(2, "0");
    return `${hh}:${mm}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: apps } = await api.get(
          `/AppointmentRequest/consultants/${consultantId}`
        );
        const appsWithSchedule = await Promise.all(
          apps.map(async (a) => {
            try {
              const { data: sched } = await api.get(
                `/ConsultantSchedule/get-schedule/${a.scheduleId}`
              );
              return {
                ...a,
                scheduleDate: sched.scheduleDate,
                startTime: sched.startTime,
                endTime: sched.endTime,
              };
            } catch {
              return {
                ...a,
                scheduleDate: null,
                startTime: null,
                endTime: null,
              };
            }
          })
        );
        setAppointments(appsWithSchedule);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [consultantId]);

  if (loading) return <p>Loading…</p>;

  // phân chia theo tab
  const tabs = {
    pending: {
      label: "Chờ xác nhận",
      list: appointments
        .filter((a) => a.status === "Pending")
        .sort(
          (a, b) =>
            new Date(`${a.scheduleDate}T${a.startTime}`) -
            new Date(`${b.scheduleDate}T${b.startTime}`)
        ),
    },
    confirmed: {
      label: "Đã xác nhận",
      list: appointments.filter((a) => a.status === "Confirmed"),
    },
    completed: {
      label: "Hoàn thành",
      list: appointments.filter((a) => a.status === "Completed"),
    },
    others: {
      label: "Khác",
      list: appointments.filter(
        (a) => !["Pending", "Confirmed", "Completed"].includes(a.status)
      ),
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

      {/* Tab content */}
      <div className="space-y-4">
        {tabs[activeTab].list.map((a) => (
          <div
            key={a.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{a.clientName}</h3>
              <p className="text-sm text-gray-600">
                {a.scheduleDate ? (
                  <>
                    <div>{formatDate(a.scheduleDate)}</div>
                    <div>
                      {formatTime(a.startTime)} - {formatTime(a.endTime)}
                    </div>
                  </>
                ) : (
                  "Chưa có lịch"
                )}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                a.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : a.status === "Confirmed"
                  ? "bg-blue-100 text-blue-800"
                  : a.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {activeTab === "others" ? a.status : tabs[activeTab].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
