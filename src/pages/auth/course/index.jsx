// src/pages/auth/course/index.jsx
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import FilterPanel from "@/components/courses/FilterPanel";
import CourseList from "@/components/courses/CourseList";
import CustomPagination from "@/components/courses/Pagination";
import {
  getAllCourses,
  getCoursesByLevel,
  getCoursesByCategory,
} from "@/service/courseService";
import "./styles.css"
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    level: "All Levels",
    category: "All Categories",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];

        const { level, category } = filters;
        const onlyLevel = level !== "All Levels" && category === "All Categories";
        const onlyCat   = category !== "All Categories" && level === "All Levels";

        if (onlyLevel) {
          data = await getCoursesByLevel(level);
        } else if (onlyCat) {
          data = await getCoursesByCategory(category);
        } else if (level === "All Levels" && category === "All Categories") {
          data = await getAllCourses();
        } else {
          // cả 2 filter: lấy all rồi tự filter front-end
          const all = await getAllCourses();
          data = all.filter(
            (c) => c.level === level && c.category === category
          );
        }

        // phân trang
        const total = Math.ceil(data.length / limit) || 1;
        setTotalPages(total);
        const start = (page - 1) * limit;
        setCourses(data.slice(start, start + limit));
      } catch (err) {
        if (err.response?.status === 404) {
          // không có course phù hợp → show rỗng
          setCourses([]);
          setTotalPages(1);
        } else {
          setError(err.message || "Error loading courses");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, page]);

  const handleFilterChange = (upd) => {
    setFilters((f) => ({ ...f, ...upd }));
    setPage(1);
  };
  const handleClearFilters = () => {
    setFilters({ level: "All Levels", category: "All Categories" });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-3">
          <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-auto bg-white p-6 rounded-lg shadow">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="md:col-span-9">
          {loading && <div className="text-center py-20">Loading…</div>}
          {!loading && error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}

          {!loading && !error && (
            <>
              <h2 className="text-2xl font-semibold mb-6">All Courses</h2>

              {courses.length > 0 ? (
                <>
                  <CourseList courses={courses} />
                  <div className="mt-8 flex justify-center">
                    <CustomPagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  Không có khóa học khả dụng
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursesPage;
