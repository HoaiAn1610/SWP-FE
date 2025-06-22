// src/pages/common/home/EcommerceHome.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/config/axios";
import Header from "@/components/header";
import CourseList from "@/components/courses/CourseList";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";
import { getAllCourses } from "@/service/courseService";

export default function EcommerceHome() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // overlay
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 1) Lấy all courses
  useEffect(() => {
    setLoading(true);
    getAllCourses()
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message || "Error loading courses"))
      .finally(() => setLoading(false));
  }, []);

  // 2) Nếu user đã login thì fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return;
      try {
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

  // chỉ lấy 3 khóa đầu
  const featured = courses.slice(0, 3);

  // build enrolledCourseIds và statusMap
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const statusMap = enrollments.reduce((acc, e) => {
    acc[e.courseId] = e.status;
    return acc;
  }, {});

  // khi bấm Learn More trên CourseList
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  if (loading) return <p className="text-center py-10">Loading…</p>;
  if (error) return <p className="text-center text-red-500 py-10">Error: {error}</p>;

  return (
    <>
      <Header />

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">Featured Courses</h2>

          <CourseList
            courses={featured}
            enrolledCourseIds={enrolledCourseIds}
            statusMap={statusMap}
            onSelect={handleSelectCourse}
          />

          {courses.length > 3 && (
            <div className="flex justify-center mt-8">
              <Link
                to="/course"
                className="
                  inline-block
                  bg-indigo-600 text-white
                  px-8 py-3
                  rounded-full
                  hover:bg-indigo-700
                  transition
                "
              >
                View All Courses
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Overlay chi tiết khóa học */}
      {showModal && selectedCourse && (
        <CourseDetailOverlay
          course={selectedCourse}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
