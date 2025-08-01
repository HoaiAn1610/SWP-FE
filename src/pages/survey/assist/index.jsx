import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import { getCoursesByLevel } from "@/service/courseService";
import CourseList from "@/components/courses/CourseList";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";

export default function AssistSurveyPage() {
  const { surveyId } = useParams();

  // 1) Load & group questions by substance
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2) User progress
  const [subIndex, setSubIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  // 3) Submission result
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);

  // 4) Toggle detail display
  const [showDetail, setShowDetail] = useState(false);

  // 5) Course suggestions & enrollments
  const isLoggedIn = useMemo(() => !!localStorage.getItem("token"), []);
  const [courses, setCourses] = useState([]); // Thay suggestedCourses
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true); // Thêm để quản lý tải khóa học
  const [courseError, setCourseError] = useState(null); // Thêm để quản lý lỗi khóa học

  // Helper tính risk
  const computeRiskLevel = (score) => {
    if (score <= 4) return "Low";
    if (score <= 27) return "Medium";
    return "High";
  };

  // Load questions and group
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/surveys/1/submissions/get-questions`);
        const map = new Map();
        res.data.forEach((q) => {
          if (!map.has(q.substanceId)) {
            map.set(q.substanceId, {
              id: q.substanceId,
              name: q.substanceName,
              questions: [],
            });
          }
          map.get(q.substanceId).questions.push(q);
        });
        const arr = Array.from(map.values()).map((g) => ({
          ...g,
          questions: g.questions.sort((a, b) => a.sequence - b.sequence),
        }));
        setGroups(arr);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [surveyId]);

  // Load enrollments
  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (!userId || !isLoggedIn) return;
    api
      .get(`/CourseEnrollment/users/${userId}/enrollments`)
      .then(({ data }) => setEnrollments(data))
      .catch((err) => {
        console.error("Lỗi fetch enrollments:", err);
        setEnrollments([]);
      });
  }, [isLoggedIn]);

  // Fetch khoá học gợi ý khi có submissionDetail và login & risk != High
  useEffect(() => {
    if (!submissionDetail || !isLoggedIn) return;
    const lvl = submissionDetail.riskLevel.toLowerCase();
    if (lvl === "high") return;
    setCourseLoading(true);
    getCoursesByLevel(lvl)
      .then((c) => {
        setCourses(c.slice(0, 3)); // Giới hạn 3 khóa học
        setCourseLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch courses:", err);
        setCourseError("Không thể tải khóa học.");
        setCourseLoading(false);
      });
  }, [submissionDetail, isLoggedIn]);

  // Advance to next group when questions exhausted
  useEffect(() => {
    if (!groups.length) return;
    const group = groups[subIndex];
    if (group && qIndex >= group.questions.length) {
      setSubIndex((i) => i + 1);
      setQIndex(0);
    }
  }, [qIndex, groups, subIndex]);

  // When all questions done: submit or compute locally
  useEffect(() => {
    if (!groups.length || subIndex < groups.length) return;

    // Compute score & risk locally
    const totalScore = answers.reduce((sum, a) => sum + (a.scoreValue || 0), 0);
    const riskLevel = computeRiskLevel(totalScore);
    const recommendation = (() => {
      switch (riskLevel) {
        case "Low":
          return "Bạn có mức rủi ro thấp. Tham khảo các khóa cơ bản về phòng ngừa và nâng cao sức khỏe.";
        case "Medium":
          return "Bạn có mức rủi ro trung bình. Mời tham gia khóa tư vấn trực tuyến hoặc workshop giảm sử dụng.";
        case "High":
          return "Bạn có mức rủi ro cao. Vui lòng đặt lịch tư vấn cá nhân ngay với chuyên gia.";
        default:
          return "";
      }
    })();

    if (isLoggedIn) {
      // Gửi lên server nếu đã login
      (async () => {
        try {
          const payload = answers.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId,
          }));
          const res = await api.post(`/surveys/1/submissions/submit`, payload);
          setSubmissionId(res.data.id);
        } catch (e) {
          setError(e.response?.data?.message || e.message);
        }
      })();
    } else {
      // Không gọi API, hiển thị kết quả tạm
      setSubmissionDetail({
        score: totalScore,
        riskLevel,
        recommendation,
        answers,
      });
    }
  }, [subIndex, groups, answers, surveyId, isLoggedIn]);

  // Fetch submission detail từ server nếu login
  useEffect(() => {
    if (!submissionId || !isLoggedIn) return;
    api
      .get(`/surveys/1/submissions/${submissionId}`)
      .then(({ data }) => setSubmissionDetail(data))
      .catch(console.error);
  }, [submissionId, surveyId, isLoggedIn]);

  // Handle answer selection
  const handleAnswer = (opt) => {
    const group = groups[subIndex];
    const current = group.questions[qIndex];
    setAnswers((a) => [
      ...a,
      { questionId: current.id, optionId: opt.id, scoreValue: opt.scoreValue },
    ]);
    if (current.sequence === 1 && opt.scoreValue === 0) {
      setSubIndex((i) => i + 1);
      setQIndex(0);
    } else {
      setQIndex((i) => i + 1);
    }
  };

  // Handle course selection for overlay
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  // Map enrollments to course IDs and status
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const statusMap = enrollments.reduce((m, e) => {
    m[e.courseId] = e.status; // "Enrolled" hoặc "Completed"
    return m;
  }, {});

  // Render loading / error
  if (loading) return <p className="text-center py-10">Đang tải khảo sát…</p>;
  if (error) return <p className="text-center text-red-500 py-10">Lỗi: {error}</p>;

  // Khi có submissionDetail
  if (submissionDetail) {
    const { score, riskLevel, recommendation, answers: ansList } = submissionDetail;
    const flatMap = {};
    groups.forEach((g) =>
      g.questions.forEach(
        (q) => (flatMap[q.id] = { ...q, substanceName: g.name })
      )
    );
    const groupedAns = ansList.reduce((acc, a) => {
      const q = flatMap[a.questionId];
      if (!acc[q.substanceName]) acc[q.substanceName] = [];
      acc[q.substanceName].push({
        questionText: q.questionText,
        optionText: q.options.find((o) => o.id === a.optionId)?.optionText,
      });
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-3xl font-semibold text-indigo-700 mb-4">
                Kết quả khảo sát
              </h1>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt>Điểm:</dt>
                  <dd>{score}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Mức độ rủi ro:</dt>
                  <dd>{riskLevel === "Low" ? "Thấp" : riskLevel === "Medium" ? "Trung bình" : "Cao"}</dd>
                </div>
              </dl>
            </div>
            {isLoggedIn ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
                  Đề xuất
                </h2>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
                  Đề xuất
                </h2>
                <p className="text-gray-700">
                  Vui lòng đăng nhập để xem đề xuất
                </p>
              </div>
            )}
          </div>

          {/* Gợi ý khóa học (chỉ khi login và Low/Medium) */}
          {isLoggedIn && (riskLevel === "Low" || riskLevel === "Medium") && (
            <section className="py-16 bg-gray-50">
              <div className="max-w-[90rem] mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-6">
                  Gợi ý khóa học
                </h2>
                {courseLoading ? (
                  <p className="text-center py-10">Đang tải khóa học...</p>
                ) : courseError || courses.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">
                    Không có khóa học nào.
                  </p>
                ) : (
                  <>
                    <CourseList
                      courses={courses}
                      enrolledCourseIds={enrolledCourseIds}
                      statusMap={statusMap}
                      onSelect={handleSelectCourse}
                    />
                    {courses.length > 3 && (
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
                  </>
                )}
              </div>
            </section>
          )}

          {/* Overlay chi tiết khóa học */}
          {showModal && selectedCourse && (
            <CourseDetailOverlay
              course={selectedCourse}
              status={statusMap[selectedCourse.id]}
              onClose={handleCloseModal}
            />
          )}

          {/* Nút đặt lịch */}
          {isLoggedIn && (riskLevel === "Medium" || riskLevel === "High") && (
            <div className="text-center">
              <Link
                to="/appointments/book"
                className="inline-block mt-4 px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
              >
                {riskLevel === "High"
                  ? "Đặt lịch tư vấn ngay"
                  : "Xem lịch tư vấn"}
              </Link>
            </div>
          )}

          {/* Nút xem/ẩn chi tiết */}
          <div className="flex justify-center my-8">
            <button
              onClick={() => setShowDetail((d) => !d)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow"
            >
              {showDetail ? "Ẩn chi tiết bài làm" : "Xem chi tiết bài làm"}
            </button>
          </div>

          {showDetail &&
            Object.entries(groupedAns).map(([subName, items]) => (
              <div key={subName} className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">{subName}</h2>
                <ul className="space-y-4">
                  {items.map((it, idx) => (
                    <li
                      key={idx}
                      className="border-l-4 border-indigo-500 bg-gray-50 p-4 rounded"
                    >
                      <p className="font-medium">{it.questionText}</p>
                      <p className="mt-1 text-indigo-600">
                        Lựa chọn của bạn: {it.optionText}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // In-progress rendering
  if (!groups.length || subIndex >= groups.length) {
    return <p className="text-center py-10">Đang gửi kết quả…</p>;
  }
  const group = groups[subIndex];
  const current = group.questions[qIndex];
  if (!current) {
    return <p className="text-center py-10">Đang chuyển nhóm…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-semibold mb-3">Bài Khảo sát ASSIST</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold mb-2">
            {group.name} – Câu hỏi {current.sequence}
          </h1>
          <p className="text-gray-700 mb-4">{current.questionText}</p>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 transition"
              >
                {opt.optionText}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}