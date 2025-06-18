import React, { useEffect, useState } from "react";
import { fetchCourses } from "../../config/axios";
// import CourseListing from "../components/CourseListing";

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses()
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading courses…</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <>
      <h2 className="mb-4">Course Catalog</h2>
      <CourseListing courses={courses} />
    </>
  );
};

export default CoursePage;
