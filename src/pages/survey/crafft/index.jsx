import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import { getCoursesByLevel } from "@/service/courseService";
import CourseList from "@/components/courses/CourseList";
import CourseDetailOverlay from "@/components/courses/CourseDetailOverlay";

export default function CrafftPage() {
  const { surveyId } = useParams();

  // 1) Kiểm tra xác thực
  const isLoggedIn = useMemo(() => !!localStorage.getItem("token"), []);

  // Chung
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("A");

  // Giai đoạn A
  const [aIndex, setAIndex] = useState(0);
  const [aAnswers, setAAnswers] = useState({});
  const [currentAValue, setCurrentAValue] = useState("");

  // Giai đoạn B
  const [bQuestions, setBQuestions] = useState([]);
  const [bIndex, setBIndex] = useState(0);
  const [bAnswers, setBAnswers] = useState([]);

  // Kết quả
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Khóa học gợi ý
  const [suggestedCourses, setSuggestedCourses] = useState([]);

  // Overlay chi tiết khóa học
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Tải & nhóm câu hỏi ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/surveys/2/submissions/get-questions`);
        const map = new Map();
        res.data.forEach((q) => {
          if (!map.has(q.substanceName)) {
            map.set(q.substanceName, { name: q.substanceName, questions: [] });
          }
          map.get(q.substanceName).questions.push(q);
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
    })();
  }, [surveyId]);

  const getRecommendationsByRisk = (level) => {
    switch (level) {
      case "Low":
        return "Bạn có mức rủi ro thấp. Tham khảo khóa cơ bản.";
      case "Medium":
        return "Bạn có mức rủi ro trung bình. Tham gia workshop giảm sử dụng.";
      case "High":
        return "Bạn có mức rủi ro cao. Đặt lịch tư vấn cá nhân.";
      default:
        return "";
    }
  };

  // --- Chuyển sang bước tiếp theo Giai đoạn A ---
  const handleANext = () => {
    const groupA = groups.find((g) => g.name === "Phần A");
    if (!groupA) return;
    const qA = groupA.questions[aIndex];
    const num = Number(currentAValue);
    if (currentAValue === "" || isNaN(num)) return;

    const updatedA = { ...aAnswers, [qA.id]: num };
    setAAnswers(updatedA);

    if (aIndex + 1 < groupA.questions.length) {
      setAIndex((i) => i + 1);
      setCurrentAValue("");
    } else {
      // Chuyển sang Giai đoạn B
      const sumA = Object.values(updatedA).reduce((s, v) => s + v, 0);
      const groupB = groups.find((g) => g.name === "Phần B");
      if (groupB) {
        setBQuestions(
          sumA >= 1 ? groupB.questions : groupB.questions.slice(0, 1)
        );
        setPhase("B");
      }
    }
  };

  // --- Chuyển sang bước tiếp theo Giai đoạn B & tính điểm ---
  const handleBNext = (opt) => {
    const qB = bQuestions[bIndex];
    const nextB = [...bAnswers, { questionId: qB.id, optionId: opt.id }];
    setBAnswers(nextB);

    if (bIndex + 1 < bQuestions.length) {
      setBIndex((i) => i + 1);
    } else {
      // Tính điểm B (nếu chưa đăng nhập): +1 điểm nếu chọn 'Có'
      const totalScore = nextB.reduce((sum, a) => {
        const question = bQuestions.find((q) => q.id === a.questionId);
        const selectedOption = question?.options.find((o) => o.id === a.optionId);
        return sum + (selectedOption?.optionText === 'Có' ? 1 : 0);
      }, 0);
      const riskLevel =
        totalScore === 0 ? "Low" : totalScore >= 3 ? "High" : "Medium";

      const result = {
        score: totalScore,
        riskLevel,
        recommendation: getRecommendationsByRisk(riskLevel),
        answers: nextB,
      };

      // Nếu đã đăng nhập, gửi lên server để lưu
      if (isLoggedIn) {
        const payload = [
          ...Object.entries(aAnswers).map(([qid, val]) => ({
            questionId: Number(qid),
            optionId: null,
            scoreValue: val,
          })),
          ...nextB.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId,
          })),
        ];
        api
          .post(`/surveys/2/submissions/submit`, payload)
          .then((r) =>
            setSubmissionResult({ ...r.data, answers: nextB })
          )
          .catch((err) => setError(err.message));
      } else {
        // Hiển thị tạm trên client
        setSubmissionResult(result);
      }

      setPhase("RESULT");
    }
  };

  // --- Khi có kết quả và đã đăng nhập & mức độ <> High → tìm khóa học ---
  useEffect(() => {
    if (!submissionResult || !isLoggedIn) return;
    const lvl = submissionResult.riskLevel.toLowerCase();
    if (lvl === "high") return;
    getCoursesByLevel(lvl)
      .then((c) => setSuggestedCourses(c.slice(0, 3)))
      .catch(console.error);
  }, [submissionResult, isLoggedIn]);

  // Hiển thị loading / lỗi
  if (loading) return <p className="text-center py-10">Đang tải…</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  // --- RENDER GIAI ĐOẠN A ---
  if (phase === "A") {
    const groupA = groups.find((g) => g.name === "Phần A") || { questions: [] };
    const qA = groupA.questions[aIndex];
    if (!qA) return <p className="text-center py-10">Không có câu A</p>;
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4 ">
          <h1 className="text-4xl font-semibold mb-3">Bài Khảo Sát CRAFFT</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3">
              Phần A – Câu {qA.sequence}
            </h2>
            <p className="mb-4 text-gray-700">{qA.questionText}</p>
            <input
              type="number"
              min="0"
              value={currentAValue}
              onChange={(e) => setCurrentAValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleANext()}
              placeholder="Nhập số lần…"
              className="w-full border-gray-300 border rounded px-3 py-2 focus:ring-indigo-400 focus:outline-none"
            />
            <button
              onClick={handleANext}
              disabled={!currentAValue}
              className={`mt-4 px-6 py-2 rounded text-white ${
                currentAValue
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {aIndex + 1 < groupA.questions.length
                ? "Tiếp theo"
                : "Hoàn thành Phần A"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER GIAI ĐOẠN B ---
  if (phase === "B") {
    const qB = bQuestions[bIndex];
    if (!qB) return <p className="text-center py-10">Không có câu B</p>;
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4 ">
          <h1 className="text-4xl font-semibold mb-3">Bài Khảo Sát CRAFFT</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3">
              Phần B – Câu {qB.sequence}
            </h2>
            <p className="mb-4 text-gray-700">{qB.questionText}</p>
            <div className="space-y-3">
              {qB.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleBNext(opt)}
                  className="w-full text-left px-4 py-2 border border-gray-200 rounded hover:bg-indigo-50 transition"
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

  // --- RENDER KẾT QUẢ ---
  if (phase === "RESULT" && submissionResult) {
    const { score, riskLevel, recommendation, answers } = submissionResult;
    const groupA = groups.find((g) => g.name === "Phần A") || { questions: [] };
    const groupB = groups.find((g) => g.name === "Phần B") || { questions: [] };

    // Placeholder trước khi tích hợp đăng ký khóa học
    const enrolledCourseIds = [];
    const statusMap = {};

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
          {/* Tổng quan kết quả */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-3xl font-semibold text-indigo-700 mb-4">
                Kết quả CRAFFT
              </h1>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="font-medium">Điểm:</dt>
                  <dd className="text-lg">{score}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Mức độ nguy cơ:</dt>
                  <dd className="text-lg">{riskLevel === 'Low' ? 'thấp' : riskLevel === 'Medium' ? 'trung bình' : 'cao'}</dd>
                </div>
              </dl>
            </div>
            {isLoggedIn && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
                  Đề xuất
                </h2>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            )}
            {!isLoggedIn && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
                  Đề xuất
                </h2>
                <p className="text-gray-700">
                  Vui lòng đăng nhập để xem
                </p>
              </div>
            )}
          </div>

          {/* Gợi ý khóa học (chỉ Low/Medium và khi đã đăng nhập) */}
          {isLoggedIn && (submissionResult.riskLevel === "Low" || submissionResult.riskLevel === "Medium") && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
                Gợi ý khoá học
              </h2>
              <div>
                <CourseList
                  courses={suggestedCourses}
                  enrolledCourseIds={enrolledCourseIds}
                  statusMap={statusMap}
                  onSelect={(course) => {
                    setSelectedCourse(course);
                    setShowModal(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Overlay chi tiết khóa học */}
          {showModal && selectedCourse && (
            <CourseDetailOverlay
              course={selectedCourse}
              status={statusMap[selectedCourse.id]}
              onClose={() => setShowModal(false)}
            />
          )}

          {/* Nút đặt lịch (Medium/High và khi đã đăng nhập) */}
          {isLoggedIn && (submissionResult.riskLevel === "Medium" || submissionResult.riskLevel === "High") && (
            <div className="text-center">
              <Link
                to="/appointments/book"
                className="inline-block mt-4 px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
              >
                {submissionResult.riskLevel === "High"
                  ? "Đặt lịch tư vấn ngay"
                  : "Xem lịch tư vấn"}
              </Link>
            </div>
          )}

          {/* Toggle chi tiết trả lời */}
          <div className="text-center">
            <button
              onClick={() => setShowDetail((d) => !d)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              {showDetail ? "Ẩn chi tiết trả lời" : "Xem chi tiết trả lời"}
            </button>
          </div>
          {showDetail && (
            <div className="space-y-6">
              {/* Phần A */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-2xl font-semibold mb-3">Phần A</h3>
                {groupA.questions.map((q) => (
                  <div
                    key={q.id}
                    className="mb-2 border-l-4 border-indigo-500 bg-gray-50 p-3 rounded"
                  >
                    <p className="font-medium">{q.questionText}</p>
                    <p className="text-indigo-600 mt-1">
                      Nhập: {aAnswers[q.id] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
              {/* Phần B */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-2xl font-semibold mb-3">Phần B</h3>
                {answers.map((a, i) => {
                  const q = groupB.questions.find((x) => x.id === a.questionId);
                  const opt = q?.options.find((o) => o.id === a.optionId);
                  if (!q || !opt) return null;
                  return (
                    <div
                      key={i}
                      className="mb-2 border-l-4 border-indigo-500 bg-gray-50 p-3 rounded"
                    >
                      <p className="font-medium">{q.questionText}</p>
                      <p className="text-indigo-600 mt-1">
                        Chọn: {opt.optionText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
