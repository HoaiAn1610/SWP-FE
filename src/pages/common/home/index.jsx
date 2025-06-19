import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CourseList from "@/components/courses/CourseList";
import Header from "@/components/header";
import { getAllCourses } from "@/service/courseService";

const EcommerceHome = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAllCourses()
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center">Loading…</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  // chỉ lấy 3 khoá học đầu
  const featured = courses.slice(0, 3);

  return (
    <>
      <Header />
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">
            Featured Courses
          </h2>
          <CourseList courses={featured} />

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
    </>
  );
};

export default EcommerceHome;
