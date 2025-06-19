// src/components/courses/CourseList.jsx
import React from 'react';
import CourseCard from './CourseCard';

const CourseList = ({ courses }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map(c => (
      <CourseCard key={c.id} course={c} />
    ))}
  </div>
);

export default CourseList;
