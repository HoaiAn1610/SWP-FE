// src/pages/appointmentRequest/bookingHistory/index.jsx
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import api from "@/config/axios";

export default function BookingHistoryPage() {
  const [history, setHistory]           = useState([]);
  const [consultantsMap, setConsultantsMap] = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("id");
    // 1) Lấy lịch sử
    api.get(`/AppointmentRequest/users/${userId}`)
      .then(({ data }) => {
        setHistory(data);
        // 2) Lấy list unique consultantId
        const consIds = [...new Set(data.map(i => i.consultantId))];
        // 3) Fetch tất cả consultants (với endpoint bulk)
        api.get("/ConsultantSchedule/get-all-consultant")
          .then(({ data: cons }) => {
            // build map id → name
            const m = {};
            cons
              .filter(c => consIds.includes(c.id))
              .forEach(c => { m[c.id] = c.name; });
            setConsultantsMap(m);
          })
          .catch(console.error);
      })
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-10 text-indigo-600">Đang tải lịch sử…</p>;
  if (error)   return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header />
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
              <li
                key={item.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-100"
              >
                <div className="space-y-3 text-gray-800">
                  {/* Tên consultant */}
                  <p>
                    <span className="font-semibold text-indigo-600">Chuyên gia:</span>{" "}
                    {consultantsMap[item.consultantId] || "Đang cập nhật"}
                  </p>
                  {/* Trạng thái */}
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
                  {/* Ngày tạo */}
                  <p>
                    <span className="font-semibold">Ngày tạo:</span>{" "}
                    {new Date(item.createdDate).toLocaleString()}
                  </p>
                  {/* Ngày huỷ nếu có */}
                  {item.cancelledDate && (
                    <p>
                      <span className="font-semibold">Ngày huỷ:</span>{" "}
                      {new Date(item.cancelledDate).toLocaleString()}
                    </p>
                  )}
                  {/* Lý do huỷ nếu có */}
                  {item.cancelReason && (
                    <p>
                      <span className="font-semibold">Lý do huỷ:</span> {item.cancelReason}
                    </p>
                  )}
                  {/* Ghi chú tư vấn nếu có */}
                  {item.consultationNotes && (
                    <p>
                      <span className="font-semibold">Ghi chú tư vấn:</span>{" "}
                      {item.consultationNotes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
