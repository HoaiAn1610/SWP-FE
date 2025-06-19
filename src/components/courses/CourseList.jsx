// src/components/courses/CourseList.jsx
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import CourseCard from './CourseCard';

const CourseList = ({ courses }) => (
  <Row className="g-4"> {/* g-4 = 1.5rem gutter */}
    {courses.map((c) => (
      <Col key={c.id} xs={12} sm={6} md={4}>
        <CourseCard course={c} />
      </Col>
    ))}
  </Row>
);

export default CourseList;
