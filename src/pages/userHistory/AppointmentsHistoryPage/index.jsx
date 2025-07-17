import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import api from "@/config/axios";

const statusLabels = {
  Pending: "Chờ duyệt",
  Confirmed: "Xác nhận",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  NoShow: "Vắng mặt",
};
const translateStatus = (status) => statusLabels[status] || status;

// Thêm hàm điều chỉnh thời gian +7 giờ
const adjustTime = (timeStr) => {
  const [hour, minute, second] = timeStr.split(':').map(Number);
  let newHour = hour + 7;
  if (newHour >= 24) newHour -= 24;
  const hh = String(newHour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function BookingHistoryPage() {
  const [history, setHistory]               = useState([]);
  const [consultantsMap, setConsultantsMap] = useState({});
  const [notesMap, setNotesMap]             = useState({});
  const [visibleNotes, setVisibleNotes]     = useState(new Set());
  const [scheduleMap, setScheduleMap]       = useState({});
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  // Alert
  const [alertVisible, setAlertVisible]     = useState(false);
  const [alertMessage, setAlertMessage]     = useState("");

  // Modal hủy
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReasonInput, setCancelReasonInput]   = useState("");
  const [cancelTargetId, setCancelTargetId]         = useState(null);

  // 1) Load booking history & consultants
  useEffect(() => {
    const userId = localStorage.getItem("id");
    api.get(`/AppointmentRequest/users/${userId}`)
      .then(({ data }) => {
        const sorted = data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        setHistory(sorted);
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

  // 2) Fetch schedule details for each booking
  useEffect(() => {
    if (history.length === 0) return;
    const uniqueIds = Array.from(new Set(history.map(item => item.scheduleId)));
    Promise.all(
      uniqueIds.map(id => api.get(`/ConsultantSchedule/get-schedule/${id}`))
    )
      .then(responses => {
        const m = {};
        responses.forEach(({ data }) => {
          m[data.id] = { startTime: data.startTime, endTime: data.endTime };
        });
        setScheduleMap(m);
      })
      .catch(err => console.error("Không lấy được thời gian lịch: ", err));
  }, [history]);

  const showAlert = msg => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const openCancelModal = requestId => {
    setCancelTargetId(requestId);
    setCancelReasonInput("");
    setCancelModalVisible(true);
  };
  const closeCancelModal = () => {
    setCancelModalVisible(false);
    setCancelTargetId(null);
    setCancelReasonInput("");
  };

  const confirmCancel = () => {
    if (!cancelReasonInput.trim()) {
      showAlert("Vui lòng nhập lý do huỷ.");
      return;
    }
    api.patch(`/AppointmentRequest/${cancelTargetId}`, { reason: cancelReasonInput })
      .then(() => {
        setHistory(h =>
          h.map(item =>
            item.id === cancelTargetId
              ? {
                  ...item,
                  status: "Cancelled",
                  cancelledDate: new Date().toISOString(),
                  cancelReason: cancelReasonInput
                }
              : item
          )
        );
        closeCancelModal();
        showAlert("Huỷ cuộc hẹn thành công");
      })
      .catch(() => showAlert("Huỷ không thành công"));
  };

  const toggleNote = appointmentId => {
    if (visibleNotes.has(appointmentId)) {
      setVisibleNotes(prev => {
        const copy = new Set(prev);
        copy.delete(appointmentId);
        return copy;
      });
    } else {
      if (notesMap[appointmentId]) {
        setVisibleNotes(prev => new Set(prev).add(appointmentId));
      } else {
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
                        : item.status === "Confirmed" || item.status === "Confirm"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                    {translateStatus(item.status)}
                  </span>
                </p>

                <p>
                  <span className="font-semibold">Ngày tạo:</span>{" "}
                  {new Date(item.createdDate).toLocaleString()}
                </p>

                {/* Hiển thị thời gian +7 giờ */}
                <p>
                  <span className="font-semibold">Thời gian:</span>{" "}
                  {scheduleMap[item.scheduleId]
                    ? `${adjustTime(scheduleMap[item.scheduleId].startTime)} - ${adjustTime(scheduleMap[item.scheduleId].endTime)}`
                    : "Đang tải thời gian..."}
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

                <div className="flex justify-start space-x-3 mt-4">
                  { ["Pending","Confirm","Confirmed"].includes(item.status) && (
                    <button
                      onClick={() => openCancelModal(item.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Hủy
                    </button>
                  ) }

                  { item.status === "Completed" && (
                    <button
                      onClick={() => toggleNote(item.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      {visibleNotes.has(item.id) ? "Ẩn ghi chú" : "Xem ghi chú"}
                    </button>
                  ) }
                </div>

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

        {/* Modal nhập lý do hủy */}
        {cancelModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Huỷ cuộc hẹn</h2>
              <textarea
                value={cancelReasonInput}
                onChange={e => setCancelReasonInput(e.target.value)}
                rows={4}
                placeholder="Nhập lý do huỷ..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-indigo-300"
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={closeCancelModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Đóng
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xác nhận huỷ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert */}
        {alertVisible && (
          <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
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
      </div>
    </div>
  );
}
