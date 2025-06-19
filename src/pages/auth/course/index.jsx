// src/pages/Course/index.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";

import Header           from "@/components/header";
import FilterPanel      from "@/components/courses/FilterPanel";
import CourseList       from "@/components/courses/CourseList";
import CustomPagination from "@/components/courses/Pagination";
import { getAllCourses } from "@/service/courseService";

const CoursesPage = () => {
  const [allCourses, setAllCourses]         = useState([]);
  const [visibleCourses, setVisibleCourses] = useState([]);
  const [filters, setFilters]               = useState({ ageGroup: "All Ages", topics: [], level: "All Levels" });
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const limit = 9; // 3 courses per row x 3 rows if needed

  // 1) Fetch all courses on mount
  useEffect(() => {
    setLoading(true);
    getAllCourses()
      .then(data => setAllCourses(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2) Apply filters and pagination
  useEffect(() => {
    if (!allCourses.length) return;
    let filtered = allCourses;
    if (filters.ageGroup !== "All Ages") {
      filtered = filtered.filter(c => c.ageGroup === filters.ageGroup);
    }
    if (filters.level !== "All Levels") {
      filtered = filtered.filter(c => c.level === filters.level);
    }
    if (filters.topics.length) {
      filtered = filtered.filter(c =>
        filters.topics.every(t => (c.topics || []).includes(t))
      );
    }
    setTotalPages(Math.ceil(filtered.length / limit) || 1);
    const start = (page - 1) * limit;
    setVisibleCourses(filtered.slice(start, start + limit));
  }, [allCourses, filters, page]);

  const handleFilterChange = upd => { setFilters(f => ({ ...f, ...upd })); setPage(1); };
  const handleClear        = () =>      { setFilters({ ageGroup: "All Ages", topics: [], level: "All Levels" }); setPage(1); };

 return (
  <>
    <Header />

    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar filter với sticky */}
        <aside className="md:col-span-3">
          <div
            className="
              sticky 
              top-24            /* đẩy xuống 6rem để khỏi chạm header (thay 24 thành phù hợp) */
              h-[calc(100vh-6rem)] /* full chiều cao viewport trừ header */
              overflow-auto     /* scroll riêng nếu filter dài */
              bg-white p-4 
              rounded-lg shadow
            "
          >
            <h5 className="font-semibold mb-4">Filter Courses</h5>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClear}
            />
          </div>
        </aside>

        {/* Content courses */}
        <main className="md:col-span-9">
          {loading ? (
            <div className="text-center py-20">Loading…</div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-6">All Courses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <CourseList courses={visibleCourses} />
              </div>
              <div className="mt-8 flex justify-center">
                <CustomPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  </>
);
}
export default CoursesPage;
