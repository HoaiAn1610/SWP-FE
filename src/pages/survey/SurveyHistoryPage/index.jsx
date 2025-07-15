import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/header";
import api from "@/config/axios";
import { getCoursesByLevel } from "@/service/courseService";
import CourseList from "@/components/courses/CourseList";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";
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

  const [activeTab, setActiveTab] = useState("assist");
  const isLoggedIn = useMemo(() => !!localStorage.getItem("token"), []);
  const memberId = localStorage.getItem("id");

  // Format ngày giờ: cộng 7 tiếng
  const formatDatePlus7 = (dateStr) =>
    new Date(new Date(dateStr).getTime() + 7 * 60 * 60 * 1000).toLocaleString(
      "vi-VN"
    );

  // Tải câu hỏi và lịch sử
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [assistQRes, crafftQRes] = await Promise.all([
          api.get(`/surveys/${ASSIST_SURVEY_ID}/submissions/get-questions`),
          api.get(`/surveys/${CRAFFT_SURVEY_ID}/submissions/get-questions`),
        ]);
        setAssistQuestions(assistQRes.data);
        setCrafftQuestions(crafftQRes.data);

        const [assistRes, crafftRes] = await Promise.all([
          api.get(
            `/surveys/${ASSIST_SURVEY_ID}/submissions/users/${memberId}/submissions`
          ),
          api.get(
            `/surveys/${CRAFFT_SURVEY_ID}/submissions/users/${memberId}/submissions`
          ),
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
            )
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
            )
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

  // Map nhanh
  const assistMap = useMemo(
    () => Object.fromEntries(assistQuestions.map((q) => [q.id, q])),
    [assistQuestions]
  );
  const crafftMap = useMemo(
    () => Object.fromEntries(crafftQuestions.map((q) => [q.id, q])),
    [crafftQuestions]
  );

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
      );
      setDetail(data);
      if (isLoggedIn) {
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

  if (loading) return <p className="text-center py-10">Đang tải lịch sử…</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  const list = activeTab === "assist" ? assistSubs : crafftSubs;
  const emptyMsg =
    activeTab === "assist"
      ? "Bạn chưa làm bài Assist."
      : "Bạn chưa làm bài CRAFFT.";
  const qMap = activeTab === "assist" ? assistMap : crafftMap;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
              onClick={() => setActiveTab(t.key)}
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

        {list.length === 0 ? (
          <p className="text-gray-600">{emptyMsg}</p>
        ) : (
          <ul className="space-y-4">
            {list.map((s) => (
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
                <span className="font-medium">ID:</span> {detail.id}
              </p>
              <p className="mb-2">
                <span className="font-medium">Ngày:</span>{" "}
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
                <span className="font-medium">Đề xuất:</span>{" "}
                {detail.recommendation}
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
                  {detail.riskLevel !== "High" && (
                    <div className="bg-white p-6 rounded-lg shadow mb-4">
                      <h3 className="text-xl font-semibold mb-3">
                        Gợi ý khoá học
                      </h3>
                      <CourseList
                        courses={suggestedCourses}
                        enrolledCourseIds={[]}
                        statusMap={{}}
                        onSelect={(c) => {
                          setSelectedCourse(c);
                          setShowCourseModal(true);
                        }}
                      />
                    </div>
                  )}
                  {(detail.riskLevel === "Medium" ||
                    detail.riskLevel === "High") && (
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
                  status={null}
                  onClose={() => setShowCourseModal(false)}
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
