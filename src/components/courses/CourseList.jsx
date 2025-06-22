// src/components/courses/CourseList.jsx
import React from "react";
import CourseCard from "./CourseCard";

export default function CourseList({
  courses,
  enrolledCourseIds = [],
  statusMap = {},
  onSelect
}) {
  if (!courses || courses.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Không có khóa học khả dụng.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          status={statusMap[course.id]}       // status từ API
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
