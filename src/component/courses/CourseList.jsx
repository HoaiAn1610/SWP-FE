import React from "react";
import { Row, Col } from "react-bootstrap";
import CourseCard from "./CourseCard";

const CourseList = ({ courses }) => (
  <Row>
    {courses.map((c) => (
      <Col key={c.id} xs={12} md={6} lg={4} className="mb-4">
        <CourseCard course={c} />
      </Col>
    ))}
  </Row>
);

export default CourseList;
