// src/pages/auth/activity/ActivitiesPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/header";
import ActivityList from "@/components/activity/ActivityList";
import CustomPagination from "@/components/courses/Pagination";
import api from "@/config/axios";
import "./styles.css";

export default function ActivitiesPage() {
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

  // FETCH & PAGINATE
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(
          "/CommunicationActivities/Get-All-Activities"
        );
        // Chỉ lấy các hoạt động đã Published và sự kiện sắp tới
        const upcoming = data
          .filter(
            (a) =>
              a.status === "Published" && new Date(a.eventDate) > new Date()
          )
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        const total = Math.ceil(upcoming.length / limit) || 1;
        setTotalPages(total);
        const start = (page - 1) * limit;
        setActivities(upcoming.slice(start, start + limit));
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi khi tải hoạt động");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  // Auto-open detail khi có ?openOverlay=
  useEffect(() => {
    if (openId && activities.length) {
      const act = activities.find((a) => String(a.id) === openId);
      if (act) {
        navigate(`/activities/${act.id}`, { replace: true });
      }
    }
  }, [openId, activities, navigate]);

  const handleSelect = (activity) => {
    navigate(`/activities/${activity.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && <p className="text-center py-10">Đang tải hoạt động…</p>}
        {error && <p className="text-center text-red-500 py-10">{error}</p>}
        {!loading && !error && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Hoạt động sắp tới
            </h2>

            <ActivityList activities={activities} onSelect={handleSelect} />

            <div className="mt-8 flex justify-center">
              <CustomPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
