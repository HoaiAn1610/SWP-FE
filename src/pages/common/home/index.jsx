import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";
import logo from "../../../assets/logo.png";
import CourseList from "@/components/courses/CourseList";
import Header from "@/components/header";
import { getAllCourses } from "../../../service/courseService";
function EcommerceHome() {
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

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <><Header />
      <div>
      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-6">Featured Courses</h2>
          {loading ? (
            <p className="text-center">Loading courses…</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <CourseList courses={courses.slice(0, 6)} />
          )}
        </div>
      </section>
    </div></>
  );
}

export default EcommerceHome;
