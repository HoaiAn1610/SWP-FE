import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import api from "../../config/axios";
import FilterPanel from "@/components/courses/FilterPanel";
import CourseList from "@/components/courses/CourseList";
import CustomPagination from "@/components/courses/Pagination";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    ageGroup: "All Ages",
    topics: [],
    level: "All Levels",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchCourses();
  }, [filters, page]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.ageGroup !== "All Ages") params.ageGroup = filters.ageGroup;
      if (filters.topics.length) params.topics = filters.topics.join(",");
      if (filters.level !== "All Levels") params.level = filters.level;
      const res = await api.get("/courses", { params });
      // giả sử API trả { items: [], totalPages: n }
      setCourses(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (upd) => {
    setFilters((f) => ({ ...f, ...upd }));
    setPage(1);
  };

  const handleClear = () => {
    setFilters({ ageGroup: "All Ages", topics: [], level: "All Levels" });
    setPage(1);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={3}>
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClear}
          />
        </Col>
        <Col md={9}>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <CourseList courses={courses} />
              <div className="d-flex justify-content-center mt-4">
                <CustomPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Courses;
