import React from 'react';
import CourseCard from './CourseCard';

const CourseList = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Không có khóa học khả dụng.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(c => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
};

export default CourseList;
