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
import "./styles.css";
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ level: "All Levels", category: "All Categories" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 9;

  // Fetch data based on filters/page
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (filters.level !== "All Levels") {
          data = await getCoursesByLevel(filters.level);
        } else if (filters.category !== "All Categories") {
          data = await getCoursesByCategory(filters.category);
        } else {
          data = await getAllCourses();
        }
        const total = Math.ceil(data.length / limit) || 1;
        setTotalPages(total);
        const start = (page - 1) * limit;
        setCourses(data.slice(start, start + limit));
      } catch (err) {
        setError(err.message || "Error loading courses");
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
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {!loading && !error && (
            <>
              <h2 className="text-2xl font-semibold mb-6">All Courses</h2>
              <CourseList courses={courses} />
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
  );
};

export default CoursesPage;
