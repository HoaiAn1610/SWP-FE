import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/header";
import FilterPanel from "@/components/courses/FilterPanel";
import CourseList from "@/components/courses/CourseList";
import CustomPagination from "@/components/courses/Pagination";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";
import { getAllCourses } from "@/service/courseService";
import api from "@/config/axios";
import "./styles.css";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [filters, setFilters] = useState({ level: "all", category: "all" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 9;

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const openId = qs.get("openOverlay");

  // Alert popup state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  // 1) Lấy ghi danh của người dùng
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const userId = localStorage.getItem("id");
        if (!userId) return;
        const { data } = await api.get(
          `/CourseEnrollment/users/${userId}/enrollments`
        );
        setEnrollments(data);
      } catch (err) {
        showAlert(
          "Lỗi tải ghi danh: " + (err.message || err)
        );
        setEnrollments([]);
      }
    };
    fetchEnrollments();
  }, []);

  // 2) Lấy khóa học và áp dụng bộ lọc
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy tất cả khóa học
        let data = await getAllCourses();
        // Chỉ lấy khóa đã xuất bản
        data = data.filter((c) => c.status === "Published");

        // Áp dụng bộ lọc Mức độ
        if (filters.level !== "all") {
          data = data.filter(
            (c) =>
              c.level &&
              c.level.toString().toLowerCase() ===
                filters.level.toString().toLowerCase()
          );
        }
        // Áp dụng bộ lọc Danh mục
        if (filters.category !== "all") {
          data = data.filter(
            (c) => c.category && c.category === filters.category
          );
        }

        // Tính tổng trang và phân trang
        const total = Math.ceil(data.length / limit) || 1;
        setTotalPages(total);
        const start = (page - 1) * limit;
        setCourses(data.slice(start, start + limit));
      } catch (err) {
        const msg = err.response?.status === 404
          ? "Không tìm thấy khóa học"
          : err.message || "Lỗi tải khóa học";
        setError(msg);
        showAlert(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, page]);

  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const statusMap = enrollments.reduce((m, e) => {
    m[e.courseId] = e.status;
    return m;
  }, {});

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (upd) => {
    setFilters((f) => ({ ...f, ...upd }));
    setPage(1);
  };
  const handleClearFilters = () => {
    setFilters({ level: "all", category: "all" });
    setPage(1);
  };

  // Mở chi tiết khóa học
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  // Mở overlay khi có tham số URL
  useEffect(() => {
    if (openId && courses.length) {
      const c = courses.find((c) => String(c.id) === openId);
      if (c) handleSelectCourse(c);
    }
  }, [openId, courses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-[90rem] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
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
          {loading && <div className="text-center py-20">Đang tải…</div>}
          {!loading && error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          {!loading && !error && (
            <>
              <h2 className="text-2xl font-semibold mb-6">Tất cả khóa học</h2>
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
                  Không có khóa học
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {showModal && selectedCourse && (
        <CourseDetailOverlay
          course={selectedCourse}
          status={statusMap[selectedCourse.id]}
          onClose={handleCloseModal}
        />
      )}

      {/* Popup cảnh báo */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
