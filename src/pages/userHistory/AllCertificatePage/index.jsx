// src/pages/auth/course/CertificateHistoryPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";

export default function CertificateHistoryPage() {
  const [certs, setCerts] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const memberId = localStorage.getItem("id");
        if (!memberId) throw new Error("Vui lòng đăng nhập để xem chứng chỉ.");

        // 1) Fetch all certificate metadata for user
        const { data: certMeta } = await api.get(
          `/Certificate/member/${memberId}`
        );
        setCerts(certMeta);

        // 2) Fetch course titles for each certificate
        const uniqueCourseIds = [...new Set(certMeta.map((c) => c.courseId))];
        const map = {};
        await Promise.all(
          uniqueCourseIds.map(async (cid) => {
            try {
              const { data: course } = await api.get(
                `/Course/get-course/${cid}`
              );
              map[cid] = course.title || `Khóa ${cid}`;
            } catch {
              map[cid] = `Khóa ${cid}`;
            }
          })
        );
        setCoursesMap(map);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <p className="text-center py-10">Đang tải chứng chỉ…</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold text-center mb-6">
          Lịch sử chứng chỉ
        </h1>
        {certs.length === 0 ? (
          <p className="text-center text-gray-600">
            Bạn chưa có chứng chỉ nào.
          </p>
        ) : (
          <ul className="space-y-4">
            {certs.map((c) => (
              <li
                key={c.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <h2 className="text-xl font-medium">
                  {coursesMap[c.courseId]}
                </h2>
                <p className="text-gray-600 mt-1">
                  Ngày cấp: {new Date(c.issuedDate).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-gray-600">Số chứng chỉ: {c.certificateNo}</p>
                <div className="mt-4 text-right">
                  <Link
                    to={`/course/${c.courseId}/certificate`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Xem chứng chỉ
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
