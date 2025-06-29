// src/pages/appointmentRequest/bookingHistory/index.jsx
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import api from "@/config/axios";

export default function BookingHistoryPage() {
  const [history, setHistory]             = useState([]);
  const [consultantsMap, setConsultantsMap] = useState({});
  const [notesMap, setNotesMap]           = useState({});
  const [visibleNotes, setVisibleNotes]   = useState(new Set());
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // Alert / Confirm
  const [alertVisible, setAlertVisible]   = useState(false);
  const [alertMessage, setAlertMessage]   = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  useEffect(() => {
    const userId = localStorage.getItem("id");
    api.get(`/AppointmentRequest/users/${userId}`)
      .then(({ data }) => {
        setHistory(data);
        return api.get("/ConsultantSchedule/get-all-consultant");
      })
      .then(({ data: cons }) => {
        const m = {};
        cons.forEach(c => { m[c.id] = c.name; });
        setConsultantsMap(m);
      })
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  const showAlert = msg => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const handleCancel = requestId => {
    showConfirm(
      "Bạn có chắc muốn huỷ cuộc hẹn này không?",
      () => {
        api.delete(`/AppointmentRequest/${requestId}`)
          .then(() => {
            setHistory(h => h.filter(item => item.id !== requestId));
            showAlert("Huỷ cuộc hẹn thành công");
          })
          .catch(() => showAlert("Huỷ không thành công"));
      }
    );
  };

  const toggleNote = appointmentId => {
    if (visibleNotes.has(appointmentId)) {
      // ẩn ghi chú
      setVisibleNotes(prev => {
        const copy = new Set(prev);
        copy.delete(appointmentId);
        return copy;
      });
    } else {
      // nếu đã có ghi chú, chỉ bật hiển thị
      if (notesMap[appointmentId]) {
        setVisibleNotes(prev => new Set(prev).add(appointmentId));
      } else {
        // fetch ghi chú
        api.get(`/ConsultationNote/get-note?appointmentId=${appointmentId}`)
          .then(({ data }) => {
            if (data.length > 0) {
              setNotesMap(n => ({ ...n, [appointmentId]: data[0].notes }));
              setVisibleNotes(prev => new Set(prev).add(appointmentId));
            } else {
              showAlert("Chưa có ghi chú từ chuyên gia.");
            }
          })
          .catch(() => showAlert("Không lấy được ghi chú"));
      }
    }
  };

  if (loading) return <p className="text-center py-10 text-indigo-600">Đang tải lịch sử…</p>;
  if (error)   return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header/>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-2">
          📖 Lịch sử đặt lịch
        </h1>

        {history.length === 0 ? (
          <p className="text-center text-gray-600 mt-12">
            Bạn chưa có lịch sử đặt lịch nào.
          </p>
        ) : (
          <ul className="space-y-6">
            {history.map(item => (
              <li key={item.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-100">

                <p>
                  <span className="font-semibold text-indigo-600">Chuyên gia:</span>{" "}
                  {consultantsMap[item.consultantId] || "Đang cập nhật"}
                </p>
                <p>
                  <span className="font-semibold">Trạng thái:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Ngày tạo:</span>{" "}
                  {new Date(item.createdDate).toLocaleString()}
                </p>
                {item.cancelledDate && (
                  <p>
                    <span className="font-semibold">Ngày huỷ:</span>{" "}
                    {new Date(item.cancelledDate).toLocaleString()}
                  </p>
                )}
                {item.cancelReason && (
                  <p>
                    <span className="font-semibold">Lý do huỷ:</span> {item.cancelReason}
                  </p>
                )}

                {/* Buttons bên trái */}
                <div className="flex justify-start space-x-3 mt-4">
                  {(item.status === "Pending" || item.status === "Confirm") && (
                    <button
                      onClick={() => handleCancel(item.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Hủy
                    </button>
                  )}
                  {item.status === "Completed" && (
                    <button
                      onClick={() => toggleNote(item.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      {visibleNotes.has(item.id) ? "Ẩn ghi chú" : "Xem ghi chú"}
                    </button>
                  )}
                </div>

                {/* Hiển thị note nếu có và đang visible */}
                {visibleNotes.has(item.id) && notesMap[item.id] && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-300 rounded">
                    <p className="font-medium text-blue-700">Ghi chú chuyên gia:</p>
                    <p className="mt-1 text-gray-800">{notesMap[item.id]}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

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
                onClick={() => {
                  confirmAction();
                  hideConfirm();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                OK
              </button>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
