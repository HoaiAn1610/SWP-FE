// src/pages/consultant/view-course-page/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/axios";
import mammoth from "mammoth";

export default function ViewCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [docHtml, setDocHtml] = useState({});

  // Load course + materials
  useEffect(() => {
    (async () => {
      try {
        const { data: c } = await api.get(`Course/get-course/${courseId}`);
        setCourse(c);
      } catch (err) {
        alert("Không tải được dữ liệu khóa học.");
        return navigate(-1);
      }
      try {
        const { data: m } = await api.get(
          `courses/${courseId}/CourseMaterial/get-materials-of-course`
        );
        setMaterials(m);
      } catch {
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, navigate]);

  // Convert document to HTML via mammoth
  useEffect(() => {
    materials
      .filter((m) => m.type === "Document")
      .forEach(async (m) => {
        try {
          const resp = await fetch(m.url);
          const arrayBuffer = await resp.arrayBuffer();
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          setDocHtml((prev) => ({ ...prev, [m.id]: html }));
        } catch {
          console.error(`Lỗi convert material ${m.id}`);
        }
      });
  }, [materials]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Course Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Back
          </button>
        </div>

        {/* Course Info */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {course.title}
          </h2>
          <img
            src={course.image}
            alt={course.title}
            className="w-full max-h-64 object-cover rounded-lg border"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <strong>Description:</strong>
              <p className="mt-1">{course.description}</p>
            </div>
            <div>
              <strong>Content:</strong>
              <p className="mt-1">{course.content}</p>
            </div>
            <div>
              <strong>Category:</strong> {course.category}
            </div>
            <div>
              <strong>Level:</strong> {course.level}
            </div>
            <div>
              <strong>Duration:</strong> {course.duration} phút
            </div>
            <div>
              <strong>Passing Score:</strong> {course.passingScore}
            </div>
            <div>
              <strong>Status:</strong> {course.status}
            </div>
          </div>
        </section>

        {/* Materials */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Materials</h2>
          {materials.length === 0 ? (
            <p className="text-gray-500">No materials available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {m.title}
                  </h3>
                  {/* Render theo loại */}
                  {m.type === "Video" ? (
                    <video
                      controls
                      src={m.url}
                      className="w-full max-h-48 rounded-lg mb-4 border"
                    />
                  ) : /\.(jpe?g|png|gif|bmp|webp)$/i.test(m.url) ? (
                    <img
                      src={m.url}
                      alt={m.title}
                      className="w-full max-h-48 object-contain rounded-lg mb-4 border"
                    />
                  ) : m.type === "Document" ? (
                    <div
                      className="prose max-w-none mb-4 overflow-x-auto"
                      dangerouslySetInnerHTML={{
                        __html: docHtml[m.id] || "<p>Loading document…</p>",
                      }}
                    />
                  ) : (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mb-4 block"
                    >
                      Download File
                    </a>
                  )}
                  <p className="text-gray-600 mb-1">
                    <strong>Description:</strong> {m.description}
                  </p>
                  <p className="text-gray-600">
                    <strong>Sort Order:</strong> {m.sortOrder}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
