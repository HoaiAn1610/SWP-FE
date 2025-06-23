// src/pages/consultant/view-course-page/index.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/axios";
import mammoth from "mammoth";

export default function ViewCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [docHtml, setDocHtml] = useState({}); // lưu HTML của các document

  useEffect(() => {
    (async () => {
      // 1. Lấy thông tin course
      try {
        const { data: c } = await api.get(`Course/get-course/${courseId}`);
        setCourse(c);
      } catch (err) {
        console.error("Lấy course lỗi:", err);
        alert("Không tải được dữ liệu khóa học.");
        navigate(-1);
        return;
      }

      // 2. Lấy materials (nếu lỗi thì bỏ qua)
      try {
        const { data: m } = await api.get(
          `courses/${courseId}/CourseMaterial/get-materials-of-course`
        );
        setMaterials(m);
      } catch (err) {
        console.warn("Không lấy được materials, bỏ qua:", err);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, navigate]);

  // 3. Với mỗi material type=Document, fetch arrayBuffer rồi convert bằng mammoth
  useEffect(() => {
    materials
      .filter((m) => m.type === "Document")
      .forEach(async (m) => {
        try {
          const resp = await fetch(m.url);
          const arrayBuffer = await resp.arrayBuffer();
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          setDocHtml((prev) => ({ ...prev, [m.id]: html }));
        } catch (err) {
          console.error(`Mammoth convert lỗi cho material ${m.id}:`, err);
        }
      });
  }, [materials]);

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            View Course: {course.title}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Back
          </button>
        </div>

        {/* Course Info */}
        <section className="bg-white p-6 rounded shadow space-y-2">
          <div>
            <strong>Title:</strong> {course.title}
          </div>
          <div>
            <strong>Image:</strong>
            <div className="mt-2">
              <img
                src={course.image}
                alt={course.title}
                className="max-w-full h-auto rounded"
              />
            </div>
          </div>
          <div>
            <strong>Description:</strong> {course.description}
          </div>
          <div>
            <strong>Content:</strong> {course.content}
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
        </section>

        {/* Materials */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Materials</h2>
          {materials.length === 0 ? (
            <p className="text-gray-500">Chưa có material nào.</p>
          ) : (
            materials.map((m) => (
              <div key={m.id} className="bg-white p-4 rounded shadow space-y-3">
                <div>
                  <strong>{m.title}</strong> ({m.type})
                </div>

                {m.type === "Video" ? (
                  <video
                    controls
                    src={m.url}
                    className="w-full max-h-64 rounded"
                  />
                ) : /\.(jpe?g|png|gif|bmp|webp)$/i.test(m.url) ? (
                  <img
                    src={m.url}
                    alt={m.title}
                    className="w-full max-h-64 object-contain rounded"
                  />
                ) : m.type === "Document" ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: docHtml[m.id] || "Đang tải nội dung…",
                    }}
                  />
                ) : (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {m.url}
                  </a>
                )}

                <div>
                  <strong>Description:</strong> {m.description}
                </div>
                <div>
                  <strong>Sort Order:</strong> {m.sortOrder}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
