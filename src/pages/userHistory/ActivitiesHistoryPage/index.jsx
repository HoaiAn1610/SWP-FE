// src/pages/auth/activity/ActivitiesHistoryPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/header";
import ActivityList from "@/components/activity/ActivityList";
import CustomPagination from "@/components/courses/Pagination";
import api from "@/config/axios";

export default function ActivitiesHistoryPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const openId = qs.get("openOverlay");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const memberId = localStorage.getItem("id");
        if (!memberId) throw new Error("Người dùng chưa đăng nhập");

        // 1) Get all user participations
        const { data: parts } = await api.get(
          `/ActivityParticipations/get-by-member/${memberId}`
        );
        const partsArr = Array.isArray(parts) ? parts : [parts];

        // 2) Get all published activities
        const { data: allActs } = await api.get(
          "/CommunicationActivities/Get-All-Activities"
        );
        const published = allActs.filter((a) => a.status === "Published");

        // 3) Merge: only include registered participations
        const merged = partsArr
          .filter((p) => p.status === "Registered")
          .map((part) => {
            const act = published.find((a) => a.id === part.activityId);
            return act
              ? {
                  ...act,
                  registrationDate: part.registrationDate,
                  participationStatus: part.status,
                }
              : null;
          })
          .filter(Boolean);

        // 4) Sort by registrationDate descending
        merged.sort(
          (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
        );

        // 5) Pagination
        const total = Math.ceil(merged.length / limit) || 1;
        setTotalPages(total);
        const start = (page - 1) * limit;
        setActivities(merged.slice(start, start + limit));
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi khi tải lịch sử hoạt động");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  // Auto-open detail if param
  useEffect(() => {
    if (openId && activities.length) {
      const act = activities.find((a) => String(a.id) === openId);
      if (act) navigate(`/activities/${act.id}`, { replace: true });
    }
  }, [openId, activities, navigate]);

  const handleSelect = (activity) => {
    navigate(`/activities/${activity.id}`);
  };

  if (loading)
    return <p className="text-center py-10">Đang tải lịch sử hoạt động…</p>;
  if (error)
    return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Hoạt động đã tham gia
        </h2>

        <ActivityList activities={activities} onSelect={handleSelect} />

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
