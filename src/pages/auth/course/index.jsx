// src/pages/auth/course/index.jsx
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import FilterPanel from "@/components/courses/FilterPanel";
import CourseList from "@/components/courses/CourseList";
import CustomPagination from "@/components/courses/Pagination";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";
import {
  getAllCourses,
  getCoursesByLevel,
  getCoursesByCategory,
} from "@/service/courseService";
import api from "@/config/axios";
import { useNavigate } from "react-router-dom";
import "./styles.css"
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);   // <-- state chứa enrollments
  const [filters, setFilters] = useState({
    level: "All Levels",
    category: "All Categories",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 9;

  const navigate = useNavigate();

  // fetch danh sách enrollment của user hiện tại
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const userId = localStorage.getItem("id");
        const { data } = await api.get(
          `/CourseEnrollment/users/${userId}/enrollments`
        );
        setEnrollments(data);
      } catch (err) {
        console.error("Lỗi fetch enrollments:", err);
      }
    };
    fetchEnrollments();
  }, []);

  // fetch courses theo filter + phân trang
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        const { level, category } = filters;
        const onlyLevel =
          level !== "All Levels" && category === "All Categories";
        const onlyCat =
          category !== "All Categories" && level === "All Levels";

        if (onlyLevel) {
          data = await getCoursesByLevel(level);
        } else if (onlyCat) {
          data = await getCoursesByCategory(category);
        } else if (
          level === "All Levels" &&
          category === "All Categories"
        ) {
          data = await getAllCourses();
        } else {
          const all = await getAllCourses();
          data = all.filter(
            (c) => c.level === level && c.category === category
          );
        }

        // chỉ show Approved
        data = data.filter((c) => c.status === "Approved");

        // phân trang
        const total = Math.ceil(data.length / limit) || 1;
        setTotalPages(total);
        const start = (page - 1) * limit;
        setCourses(data.slice(start, start + limit));
      } catch (err) {
        if (err.response?.status === 404) {
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

  // generate helper structures:
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const statusMap = enrollments.reduce((map, e) => {
    map[e.courseId] = e.status;
    return map;
  }, {});

  // các hàm filter, modal, …
  const handleFilterChange = (upd) => {
    setFilters((f) => ({ ...f, ...upd }));
    setPage(1);
  };
  const handleClearFilters = () => {
    setFilters({ level: "All Levels", category: "All Categories" });
    setPage(1);
  };

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3">
          <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-auto bg-white p-6 rounded-lg shadow">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </aside>

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
                  <CourseList
                    courses={courses}
                    enrolledCourseIds={enrolledCourseIds}
                    statusMap={statusMap}
                    onSelect={handleSelectCourse}
                  />
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

      {showModal && selectedCourse && (
        <CourseDetailOverlay
          course={selectedCourse}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
