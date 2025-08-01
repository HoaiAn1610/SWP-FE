import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/header";
import api from "@/config/axios";
import { getCoursesByLevel } from "@/service/courseService";
import CourseList from "@/components/courses/CourseList";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";
import CustomPagination from "@/components/courses/Pagination";
import { Link } from "react-router-dom";

// Mã khảo sát cố định
const ASSIST_SURVEY_ID = 1;
const CRAFFT_SURVEY_ID = 2;

export default function AllSurveyHistoryPage() {
  const [assistSubs, setAssistSubs] = useState([]);
  const [crafftSubs, setCrafftSubs] = useState([]);
  const [assistQuestions, setAssistQuestions] = useState([]);
  const [crafftQuestions, setCrafftQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal chi tiết
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  // Đề xuất khóa học
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Tab và paging
  const [activeTab, setActiveTab] = useState("assist");
  const [page, setPage] = useState(1);
  const limit = 9;

  // Course enrollment
  const [enrollments, setEnrollments] = useState([]);

  const isLoggedIn = useMemo(() => !!localStorage.getItem("token"), []);
  const memberId = localStorage.getItem("id");

  // Format ngày giờ: cộng 7 tiếng
  const formatDatePlus7 = (dateStr) =>
    new Date(new Date(dateStr).getTime() + 7 * 60 * 60 * 1000).toLocaleString(
      "vi-VN"
    );

  // Tải câu hỏi, lịch sử và enrollment
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [assistQRes, crafftQRes, enrollmentRes] = await Promise.all([
          api.get(`/surveys/${ASSIST_SURVEY_ID}/submissions/get-questions`).catch(() => ({ data: [] })),
          api.get(`/surveys/${CRAFFT_SURVEY_ID}/submissions/get-questions`).catch(() => ({ data: [] })),
          api.get(`/CourseEnrollment/users/${memberId}/enrollments`),
        ]);
        setAssistQuestions(assistQRes.data);
        setCrafftQuestions(crafftQRes.data);
        setEnrollments(enrollmentRes.data);

        const [assistRes, crafftRes] = await Promise.all([
          api.get(`/surveys/${ASSIST_SURVEY_ID}/submissions/users/${memberId}/submissions`).catch(() => ({ data: [] })),
          api.get(`/surveys/${CRAFFT_SURVEY_ID}/submissions/users/${memberId}/submissions`).catch(() => ({ data: [] })),
        ]);

        setAssistSubs(
          assistRes.data
            .map((s) => ({
              ...s,
              surveyId: ASSIST_SURVEY_ID,
              surveyName: "Assist Survey",
            }))
            .sort(
              (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)
            ) || []
        );
        setCrafftSubs(
          crafftRes.data
            .map((s) => ({
              ...s,
              surveyId: CRAFFT_SURVEY_ID,
              surveyName: "CRAFFT Survey",
            }))
            .sort(
              (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)
            ) || []
        );
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    }
    if (memberId) loadData();
    else {
      setError("Vui lòng đăng nhập để xem lịch sử khảo sát.");
      setLoading(false);
    }
  }, [memberId]);

  // Map câu hỏi theo id
  const assistMap = useMemo(
    () => Object.fromEntries(assistQuestions.map((q) => [q.id, q])),
    [assistQuestions]
  );
  const crafftMap = useMemo(
    () => Object.fromEntries(crafftQuestions.map((q) => [q.id, q])),
    [crafftQuestions]
  );

  // Chuẩn bị list và paging
  const list = activeTab === "assist" ? assistSubs : crafftSubs;
  const totalPages = Math.ceil(list.length / limit) || 1;
  const displayedSubs = list.slice((page - 1) * limit, page * limit);

  const emptyMsg =
    activeTab === "assist"
      ? "Bạn chưa làm bài khảo sát này."
      : "Bạn chưa làm bài khảo sát này.";
  const qMap = activeTab === "assist" ? assistMap : crafftMap;

  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const statusMap = enrollments.reduce((m, e) => {
    m[e.courseId] = e.status; // "Enrolled" hoặc "Completed"
    return m;
  }, {});

  const closeDetail = () => {
    setShowModal(false);
    setDetail(null);
    setSuggestedCourses([]);
  };

  const openDetail = async (sub) => {
    setSelectedSub(sub);
    setShowModal(true);
    try {
      const { data } = await api.get(
        `/surveys/${sub.surveyId}/submissions/${sub.id}`
      ).catch(() => ({ data: null }));
      setDetail(data);
      if (isLoggedIn && data) {
        const lvl = data.riskLevel.toLowerCase();
        if (lvl !== "high") {
          const courses = await getCoursesByLevel(lvl);
          setSuggestedCourses(courses.slice(0, 3));
        }
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    setSelectedCourse(null);
  };

  if (loading)
    return <p className="text-center py-10">Đang tải lịch sử…</p>;
  if (error)
    return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold text-indigo-700 mb-6">
          Lịch sử khảo sát
        </h1>
        <div className="flex space-x-4 mb-6">
          {[
            { key: "assist", label: "Assist" },
            { key: "crafft", label: "CRAFFT" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === t.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {displayedSubs.length === 0 ? (
          <p className="text-gray-600">{emptyMsg}</p>
        ) : (
          <ul className="space-y-4">
            {displayedSubs.map((s) => (
              <li
                key={s.id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p>
                    <span className="font-medium">Ngày:</span>{" "}
                    {formatDatePlus7(s.submissionDate)}
                  </p>
                  <p>
                    <span className="font-medium">Điểm:</span> {s.score}
                  </p>
                  <p>
                    <span className="font-medium">Mức độ nguy cơ:</span>{" "}
                    {s.riskLevel === "Low"
                      ? "thấp"
                      : s.riskLevel === "Medium"
                      ? "trung bình"
                      : "cao"}
                  </p>
                </div>
                <button
                  onClick={() => openDetail(s)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Xem chi tiết
                </button>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        {showModal && detail && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center"
            onClick={closeDetail}
          >
            <div
              className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold mb-4">
                Chi tiết {selectedSub.surveyName}
              </h2>
              
              <p className="mb-2">
                <span className="font-medium">Thời gian:</span>{" "}
                {formatDatePlus7(detail.submissionDate)}
              </p>
              <p className="mb-2">
                <span className="font-medium">Điểm:</span> {detail.score}
              </p>
              <p className="mb-2">
                <span className="font-medium">Mức độ nguy cơ:</span>{" "}
                {detail.riskLevel === "Low"
                  ? "thấp"
                  : detail.riskLevel === "Medium"
                  ? "trung bình"
                  : "cao"}
              </p>
              <p className="mb-4">
                <span className="font-medium">Đề xuất:</span> {detail.recommendation}
              </p>

              <div className="space-y-4 mb-6">
                {detail.answers
                  .filter((a) => a.optionId !== null)
                  .map((a, idx) => {
                    const q = qMap[a.questionId];
                    const opt = q?.options.find((o) => o.id === a.optionId);
                    return (
                      <div
                        key={idx}
                        className="border-l-4 border-indigo-500 bg-gray-50 p-4 rounded"
                      >
                        <p className="font-medium">
                          {q?.questionText || `Câu ${a.questionId}`}
                        </p>
                        <p className="text-indigo-600 mt-1">
                          {opt?.optionText || `Option ${a.optionId}`}
                        </p>
                      </div>
                    );
                  })}
              </div>

              {isLoggedIn && detail && (
                <>  
                  {detail.riskLevel !== "High" && suggestedCourses.length > 0 && (
                    <section className="py-8 bg-gray-50">
                      <div className="max-w-[90rem] mx-auto px-6">
                        <h3 className="text-xl font-semibold mb-3">
                          Gợi ý khóa học
                        </h3>
                        <CourseList
                          courses={suggestedCourses}
                          enrolledCourseIds={enrolledCourseIds}
                          statusMap={statusMap}
                          onSelect={handleSelectCourse}
                        />
                        {suggestedCourses.length > 3 && (
                          <div className="flex justify-center mt-8">
                            <Link
                              to="/course"
                              className="
                                inline-block
                                bg-indigo-600 text-white
                                px-8 py-3
                                rounded-full
                                hover:bg-indigo-700
                                transition
                              "
                            >
                              Xem tất cả khóa học
                            </Link>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                  {(detail.riskLevel === "Medium" || detail.riskLevel === "High") && (
                    <div className="text-center mb-4">
                      <Link
                        to="/appointments/book"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                      >
                        {detail.riskLevel === "High"
                          ? "Đặt lịch tư vấn ngay"
                          : "Xem lịch tư vấn"}
                      </Link>
                    </div>
                  )}
                </>
              )}

              {showCourseModal && selectedCourse && (
                <CourseDetailOverlay
                  course={selectedCourse}
                  status={statusMap[selectedCourse.id]}
                  onClose={handleCloseCourseModal}
                />
              )}

              <div className="text-right mt-6">
                <button
                  onClick={closeDetail}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}