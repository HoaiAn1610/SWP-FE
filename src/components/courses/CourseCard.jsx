import React from "react";
import { useNavigate } from "react-router-dom";
const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      {/* Banner màu theo course.color */}
            <div className="h-60 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Level badge */}
        <span className="inline-block bg-white bg-opacity-50 text-xs font-semibold text-gray-800 rounded-full py-1 mb-3">
          {course.level}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2 text-gray-900">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 flex-1">
          {course.description.slice(0, 100)}...
        </p>

        {/* Footer: duration và link */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{course.duration} phút</span>
    <button
      onClick={() => navigate(`/course/${course.id}/lesson`)}
      className="btn btn-sm btn-primary"
    >
      Start Course →
    </button>
        </div>
      </div>

     
    </div>
  );
};

export default CourseCard;
