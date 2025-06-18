import React from "react";
import { Card, Badge } from "react-bootstrap";

const CourseCard = ({ course }) => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={course.image}
        alt={course.title}
        style={{ objectFit: "cover", height: "180px" }}
      />
      <Card.Body className="d-flex flex-column">
        <Badge bg="info" className="mb-2 align-self-start">
          {course.level}
        </Badge>
        <Card.Title>{course.title}</Card.Title>
        <Card.Text className="flex-grow-1">
          {course.description.slice(0, 100)}...
        </Card.Text>
        <div className="mt-2">
          <small className="text-muted">{course.duration} giờ</small>
        </div>
      </Card.Body>
      <Card.Footer>
        <small>
          ⭐ {course.rating} ({course.reviews} reviews)
        </small>
      </Card.Footer>
    </Card>
  );
};

export default CourseCard;
