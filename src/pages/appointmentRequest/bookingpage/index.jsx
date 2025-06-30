import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";

export default function BookingPage() {
  const navigate = useNavigate();

  // Helper: format date/time with +7h offset
  const formatDateWithOffset = dateStr => {
    const dt = new Date(dateStr);
    dt.setHours(dt.getHours() + 7);
    return dt.toLocaleDateString();
  };
  const formatTimeWithOffset = (dateStr, timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const dt = new Date(dateStr);
    dt.setHours(Number(hour), Number(minute));
    dt.setHours(dt.getHours() + 7);
    return dt.toTimeString().slice(0,5);
  };

  // Danh sách consultants
  const [consultants, setConsultants] = useState([]);
  const [loadingCons, setLoadingCons] = useState(true);

  // Consultant & schedule đã chọn
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loadingSched, setLoadingSched] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  // Alert / Confirm
  const [alertVisible, setAlertVisible]     = useState(false);
  const [alertMessage, setAlertMessage]     = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction]   = useState(() => {});

  const showAlert = msg => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  // Load consultants
  useEffect(() => {
    api.get("/ConsultantSchedule/get-all-consultant")
      .then(({ data }) => setConsultants(data))
      .catch(console.error)
      .finally(() => setLoadingCons(false));
  }, []);

  // Chọn consultant
  const handleSelectConsultant = c => {
    if (selectedConsultant?.id === c.id) {
      setSelectedConsultant(null);
      setSchedules([]);
      setSelectedScheduleId(null);
      return;
    }
    setSelectedConsultant(c);
    setSelectedScheduleId(null);
    setSchedules([]);
    setLoadingSched(true);
    api.get(`/ConsultantSchedule/${c.id}`)
      .then(({ data }) => setSchedules(data))
      .catch(console.error)
      .finally(() => setLoadingSched(false));
  };

  // Khi user bấm nút "Xác nhận đặt lịch", hiện confirm trước
  const handleAttemptBooking = () => {
    if (!selectedConsultant || !selectedScheduleId) return;
    const sched = schedules.find(s => s.id === selectedScheduleId);
    const dateDisplay = formatDateWithOffset(sched.scheduleDate);
    const timeDisplay = `${formatTimeWithOffset(sched.scheduleDate, sched.startTime)}–${formatTimeWithOffset(sched.scheduleDate, sched.endTime)}`;
    showConfirm(
      `Bạn có chắc muốn đặt lịch với ${selectedConsultant.name} vào ${dateDisplay} lúc ${timeDisplay} không?`,
      () => {
        api.post("/AppointmentRequest", {
          consultantId: selectedConsultant.id,
          scheduleId: selectedScheduleId
        })
        .then(() => {
          showAlert("Gửi yêu cầu thành công!");
          navigate("/appointments/history");
        })
        .catch(err => {
          console.error(err);
          showAlert("Có lỗi khi gửi yêu cầu.");
        });
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header />

      {/* Nút Xem Lịch Sử */}
      <div className="max-w-4xl mx-auto px-4 mt-6 flex justify-end">
        <button
          onClick={() => navigate("/appointments/history")}
          className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-full shadow transition"
        >
          Xem Lịch Sử
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-indigo-700 border-b-2 border-indigo-200 pb-2">
          Book a Counseling Session
        </h1>

        {/* Danh sách consultant */}
        <div className="space-y-4">
          {loadingCons ? (
            <p className="text-gray-600">Đang tải chuyên gia…</p>
          ) : (
            <ul className="space-y-3">
              {consultants.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => handleSelectConsultant(c)}
                    className={`w-full text-left px-5 py-4 rounded-lg flex justify-between items-center transition ${
                      selectedConsultant?.id === c.id
                        ? "bg-indigo-100 shadow-lg border border-indigo-300"
                        : "bg-white border border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <span className="font-medium text-indigo-800">{c.name}</span>
                    <svg
                      className={`w-5 h-5 text-indigo-600 transform transition-transform ${
                        selectedConsultant?.id === c.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Thông tin consultant */}
        {selectedConsultant && (
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-500 p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-indigo-600">{selectedConsultant.name}</h2>
            <p className="text-gray-700">
              <span className="font-medium">SĐT:</span> {selectedConsultant.phone}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {selectedConsultant.email}
            </p>
            <p className="text-gray-600">{selectedConsultant.profileData}</p>
          </div>
        )}

        {/* Chọn lịch & xác nhận */}
        {selectedConsultant && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">
              Lịch của {selectedConsultant.name}
            </h3>

            {loadingSched ? (
              <p className="text-gray-600">Đang tải lịch…</p>
            ) : schedules.length === 0 ? (
              <p className="text-gray-500">Chưa có lịch khả dụng.</p>
            ) : (
              <ul className="space-y-2">
                {schedules.map(s => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedScheduleId(s.id)}
                      className={`w-full text-left px-4 py-2 rounded-md transition ${
                        selectedScheduleId === s.id
                          ? "bg-indigo-200 border border-indigo-400"
                          : "bg-indigo-50 hover:bg-indigo-100 border border-indigo-100"
                      }`}
                    >
                      <span className="font-medium text-indigo-800">
                        {formatDateWithOffset(s.scheduleDate)}
                      </span>{" "}
                      <span className="text-gray-700">
                        {formatTimeWithOffset(s.scheduleDate, s.startTime)} - {formatTimeWithOffset(s.scheduleDate, s.endTime)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selectedScheduleId && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleAttemptBooking}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full shadow hover:from-indigo-700 transition"
                >
                  Xác nhận đặt lịch
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{confirmMessage}</p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >
                Huỷ
              </button>
              <button
                onClick={() => { confirmAction(); hideConfirm(); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
