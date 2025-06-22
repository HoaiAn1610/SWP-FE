// src/components/courses/CourseCard.jsx
import React from "react";

export default function CourseCard({ course, status, onSelect }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-2 mb-3">
          {course.level && (
            <span className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs font-medium">
              Level: {course.level}
            </span>
          )}
          {status && (
            <span className="inline-block bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium">
              {status}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 flex-1">
          {course.description.length > 100
            ? `${course.description.slice(0, 100)}...`
            : course.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{course.duration} phút</span>
          <button
            onClick={() => onSelect(course)}
            className="px-3 py-1 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Learn More →
          </button>
        </div>
      </div>
    </div>
  );
}
