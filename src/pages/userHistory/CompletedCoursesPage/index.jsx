import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import CourseList from "@/components/courses/CourseList";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";
import CustomPagination from "@/components/courses/Pagination";
import { getAllCourses } from "@/service/courseService";
import api from "@/config/axios";

export default function CourseHistoryPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [page, setPage] = useState(1);
  const limit = 9;
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch enrollments and published courses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("id");
        if (!userId) throw new Error("Người dùng chưa đăng nhập");

        const { data: enrs } = await api.get(
          `/CourseEnrollment/users/${userId}/enrollments`
        );
        let allCourses = await getAllCourses();
        allCourses = allCourses.filter((c) => c.status === "Published");

        setEnrollments(enrs);
        setCourses(allCourses);
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare helper data
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const statusMap = enrollments.reduce((map, e) => {
    map[e.courseId] = e.status;
    return map;
  }, {});

  // Separate lists
  const enrolledCourses = enrollments
    .filter((e) => e.status === "Enrolled")
    .map((e) => ({ ...courses.find((c) => c.id === e.courseId), enrollment: e }))
    .filter(Boolean);
  const completedCourses = enrollments
    .filter((e) => e.status === "Completed")
    .map((e) => ({ ...courses.find((c) => c.id === e.courseId), enrollment: e }))
    .filter(Boolean);

  // Determine list and pagination
  const list = activeTab === "enrolled" ? enrolledCourses : completedCourses;
  const totalPages = Math.ceil(list.length / limit) || 1;
  const displayedCourses = list.slice((page - 1) * limit, page * limit);

  // Handlers
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (loading) return <div className="text-center py-20">Đang tải…</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
  
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Lịch sử khóa học</h1>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => handleTabClick("enrolled")}
            className={`px-4 py-2 -mb-px border-b-2 font-medium mr-4 transition-colors ${
              activeTab === "enrolled"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Đã tham gia
          </button>
          <button
            onClick={() => handleTabClick("completed")}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${
              activeTab === "completed"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Hoàn thành
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {displayedCourses.length > 0 ? (
            <CourseList
              courses={displayedCourses}
              enrolledCourseIds={enrolledCourseIds}
              statusMap={statusMap}
              onSelect={handleSelectCourse}
            />
          ) : (
            <p className="text-center text-gray-500 py-10">
              {activeTab === "enrolled"
                ? "Bạn chưa tham gia khóa học nào."
                : "Bạn chưa hoàn thành khóa học nào."}
            </p>
          )}
        </div>

        {/* Pagination */}
        {list.length > limit && (
          <div className="mt-8 flex justify-center">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Detail overlay */}
      {showModal && selectedCourse && (
        <CourseDetailOverlay
          course={selectedCourse}
          status={statusMap[selectedCourse.id]}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
