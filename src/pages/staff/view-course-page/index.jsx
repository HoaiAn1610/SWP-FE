// src/pages/consultant/view-course-page/index.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/axios";
import { uploadFile } from "@/utils/upload";

export default function ViewStaffCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // common state
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);

  // edit course
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    image: "",
    description: "",
    content: "",
    category: "",
    level: "",
    duration: 0,
    passingScore: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageRef = useRef(null);

  // edit material
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [materialEditData, setMaterialEditData] = useState({
    type: "",
    title: "",
    url: "",
    description: "",
    sortOrder: 0,
  });
  const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);
  const materialFileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: c } = await api.get(`Course/get-course/${courseId}`);
        setCourse(c);
      } catch (err) {
        console.error("Failed to load course data:", err);
        alert("Failed to load course data.");
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

  // --- Course handlers ---
  const startEditing = () => {
    setEditData({
      title: course.title,
      image: course.image,
      description: course.description,
      content: course.content,
      category: course.category,
      level: course.level,
      duration: course.duration,
      passingScore: course.passingScore,
    });
    setIsEditing(true);
  };
  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    setEditData((d) => ({
      ...d,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(file, "courses");
      setEditData((d) => ({ ...d, image: url }));
    } finally {
      setUploadingImage(false);
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`Course/update-course/${courseId}`, editData);
      setCourse((c) => ({ ...c, ...editData }));
      setIsEditing(false);
      alert("Course updated successfully!");
    } catch {
      alert("Update failed.");
    }
  };

  // --- Material handlers ---
  const startMaterialEdit = (mat) => {
    setEditingMaterialId(mat.id);
    setMaterialEditData({
      type: mat.type,
      title: mat.title,
      url: mat.url,
      description: mat.description,
      sortOrder: mat.sortOrder,
    });
  };
  const handleMaterialChange = (e) => {
    const { name, value, type } = e.target;
    setMaterialEditData((m) => ({
      ...m,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const handleMaterialFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMaterialFile(true);
    try {
      const url = await uploadFile(file, "materials");
      setMaterialEditData((m) => ({ ...m, url }));
    } finally {
      setUploadingMaterialFile(false);
    }
  };
  const handleMaterialEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `courses/${courseId}/CourseMaterial/update-material/${editingMaterialId}`,
        materialEditData
      );
      setMaterials((ms) =>
        ms.map((m) =>
          m.id === editingMaterialId ? { ...m, ...materialEditData } : m
        )
      );
      setEditingMaterialId(null);
      alert("Material updated!");
    } catch {
      alert("Update material failed.");
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Edit Course" : course.title}
          </h1>
          <div className="space-x-2">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={startEditing}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            >
              Back
            </button>
          </div>
        </div>

        {/* Edit Course Form */}
        {isEditing && (
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 rounded-lg shadow space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => imageRef.current.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:scale-105 transform transition"
                  >
                    {uploadingImage ? "Uploading…" : "Select Image…"}
                  </button>
                  {editData.image && (
                    <a
                      href={editData.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline break-all text-sm"
                    >
                      View Image
                    </a>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={imageRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={editData.description}
                  onChange={handleEditChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  rows={4}
                  value={editData.content}
                  onChange={handleEditChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={editData.level}
                  onChange={handleEditChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (min)
                </label>
                <input
                  name="duration"
                  type="number"
                  value={editData.duration}
                  onChange={handleEditChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score
                </label>
                <input
                  name="passingScore"
                  type="number"
                  value={editData.passingScore}
                  onChange={handleEditChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:scale-105 transform transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Course Details */}
        {!isEditing && (
          <section className="bg-white p-6 rounded-lg shadow space-y-3">
            <div>
              <strong>Title:</strong> {course.title}
            </div>
            <div>
              <strong>Image URL:</strong>{" "}
              <a
                href={course.image}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline"
              >
                View Image
              </a>
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
              <strong>Duration:</strong> {course.duration} min
            </div>
            <div>
              <strong>Passing Score:</strong> {course.passingScore}
            </div>
            <div>
              <strong>Status:</strong> {course.status}
            </div>
          </section>
        )}

        {/* Materials */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Materials</h2>
          {materials.length === 0 ? (
            <p className="text-gray-500">No materials yet.</p>
          ) : (
            materials.map((m) =>
              editingMaterialId === m.id ? (
                <form
                  key={m.id}
                  onSubmit={handleMaterialEditSubmit}
                  className="bg-white p-6 rounded-lg shadow space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={materialEditData.type}
                        onChange={handleMaterialChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">-- Select --</option>
                        <option value="Video">Video</option>
                        <option value="Document">Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        name="title"
                        value={materialEditData.title}
                        onChange={handleMaterialChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File URL
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => materialFileRef.current.click()}
                        disabled={uploadingMaterialFile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:scale-105 transform transition"
                      >
                        {uploadingMaterialFile ? "Uploading…" : "Select File…"}
                      </button>
                      {materialEditData.url && (
                        <a
                          href={materialEditData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 underline break-all text-sm"
                        >
                          View File
                        </a>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="*/*"
                      ref={materialFileRef}
                      onChange={handleMaterialFileSelect}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      value={materialEditData.description}
                      onChange={handleMaterialChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      name="sortOrder"
                      type="number"
                      value={materialEditData.sortOrder}
                      onChange={handleMaterialChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:scale-105 transform transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMaterialId(null)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  key={m.id}
                  className="bg-white p-6 rounded-lg shadow flex justify-between items-center hover:shadow-lg transition"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{m.title}</div>
                    <div className="text-sm text-gray-600">
                      {m.type} • Order: {m.sortOrder}
                    </div>
                  </div>
                  <button
                    onClick={() => startMaterialEdit(m)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                </div>
              )
            )
          )}
        </section>
      </main>
    </div>
  );
}
