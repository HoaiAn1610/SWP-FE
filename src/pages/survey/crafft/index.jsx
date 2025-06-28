// src/pages/survey/CrafftPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";

export default function CrafftPage() {
  const { surveyId } = useParams();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [phase, setPhase] = useState("A");

  // Phase A
  const [aIndex, setAIndex] = useState(0);
  const [aAnswers, setAAnswers] = useState({});
  const [currentAValue, setCurrentAValue] = useState("");

  // Phase B
  const [bQuestions, setBQuestions] = useState([]);
  const [bIndex, setBIndex] = useState(0);
  const [bAnswers, setBAnswers] = useState([]);

  // Result
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // 1) Load và nhóm câu hỏi
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/surveys/3/submissions/get-questions`);
        const map = new Map();
        res.data.forEach(q => {
          if (!map.has(q.substanceName)) {
            map.set(q.substanceName, { name: q.substanceName, questions: [] });
          }
          map.get(q.substanceName).questions.push(q);
        });
        const arr = Array.from(map.values()).map(g => ({
          ...g,
          questions: g.questions.sort((a, b) => a.sequence - b.sequence)
        }));
        setGroups(arr);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [surveyId]);

  // 2) Phần A: next
  const handleANext = () => {
    const groupA = groups.find(g => g.name === "Phần A");
    if (!groupA) return;
    const qA = groupA.questions[aIndex];
    const num = Number(currentAValue);
    if (currentAValue === "" || isNaN(num)) return;
    // lưu đáp án tạm
    const newA = { ...aAnswers, [qA.id]: num };
    setAAnswers(newA);

    if (aIndex + 1 < groupA.questions.length) {
      setAIndex(i => i + 1);
      setCurrentAValue("");
    } else {
      // sau câu cuối A, tính tổng và chọn B
      const sumA = Object.values(newA).reduce((s, v) => s + v, 0);
      const groupB = groups.find(g => g.name === "Phần B");
      if (groupB) {
        setBQuestions(sumA >= 1
          ? groupB.questions
          : groupB.questions.slice(0, 1)
        );
        setPhase("B");
      }
    }
  };

  // 3) Phần B: next
  const handleBNext = opt => {
    const qB = bQuestions[bIndex];
    setBAnswers(prev => [...prev, { questionId: qB.id, optionId: opt.id }]);
    if (bIndex + 1 < bQuestions.length) {
      setBIndex(i => i + 1);
    } else {
      // gửi payload gồm A và B
      const payload = [
        ...Object.entries(aAnswers).map(([qid, val]) => ({
          questionId: Number(qid),
          optionId: null,
          scoreValue: val
        })),
        ...bAnswers,
        { questionId: qB.id, optionId: opt.id }
      ];
      api.post(`/surveys/3/submissions/submit`, payload)
        .then(r => setSubmissionResult(r.data))
        .catch(err => setError(err.message));
      setPhase("RESULT");
    }
  };

  const getRecommendationsByRisk = level => {
    if (level === "Low")
      return "Bạn có mức rủi ro thấp. Tham khảo khóa cơ bản.";
    if (level === "Medium")
      return "Bạn có mức rủi ro trung bình. Tham gia workshop giảm sử dụng.";
    if (level === "High")
      return "Bạn có mức rủi ro cao. Đặt lịch tư vấn cá nhân.";
    return "";
  };

  if (loading) return <p className="text-center py-10">Đang tải…</p>;
  if (error)   return <p className="text-center text-red-500 py-10">{error}</p>;

  // === Phase A ===
  if (phase === "A") {
    const groupA = groups.find(g => g.name === "Phần A") || { questions: [] };
    const qA = groupA.questions[aIndex];
    if (!qA) return <p className="text-center py-10">Không có câu A</p>;
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Phần A – Câu {qA.sequence}
            </h2>
            <p className="mb-4 text-gray-700">{qA.questionText}</p>
            <input
              type="number"
              min="0"
              value={currentAValue}
              onChange={e => setCurrentAValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleANext()}
              placeholder="Nhập số lần…"
              className="w-full border-gray-300 border rounded px-4 py-2 focus:ring-indigo-400 focus:outline-none"
            />
            <button
              onClick={handleANext}
              disabled={!currentAValue}
              className={`mt-4 px-6 py-2 rounded-lg text-white transition ${
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

  // === Phase B ===
  if (phase === "B") {
    const qB = bQuestions[bIndex];
    if (!qB) return <p className="text-center py-10">Không có câu B</p>;
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Phần B – Câu {qB.sequence}
            </h2>
            <p className="mb-4 text-gray-700">{qB.questionText}</p>
            <div className="space-y-3">
              {qB.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleBNext(opt)}
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

  // === Phase RESULT ===
  if (phase === "RESULT" && submissionResult) {
    const { score, riskLevel, recommendation } = submissionResult;
    const groupA = groups.find(g => g.name === "Phần A") || { questions: [] };
    const groupB = groups.find(g => g.name === "Phần B") || { questions: [] };

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
          {/* Tổng quan */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold mb-4">Kết quả CRAFFT</h1>
            <p><strong>Score:</strong> {score}</p>
            <p><strong>Risk Level:</strong> {riskLevel}</p>
            <p className="mt-2"><strong>Recommendation:</strong> {recommendation}</p>
            <p className="mt-2 text-indigo-600">{getRecommendationsByRisk(riskLevel)}</p>
          </div>

          {/* Nút xem/ẩn chi tiết */}
          <button
            onClick={() => setShowDetail(d => !d)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {showDetail ? "Ẩn chi tiết trả lời" : "Xem chi tiết trả lời"}
          </button>

          {showDetail && (
            <div className="space-y-6">
              {/* Chi tiết Phần A */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-3">Phần A</h2>
                {groupA.questions.map(q => (
                  <div
                    key={q.id}
                    className="mb-2 border-l-4 border-indigo-500 bg-gray-50 p-3 rounded"
                  >
                    <p className="font-medium">{q.questionText}</p>
                    <p className="mt-1 text-indigo-600">
                      Nhập: {aAnswers[q.id] ?? 0}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chi tiết Phần B */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-3">Phần B</h2>
                {bAnswers.map((a, idx) => {
                  const q = groupB.questions.find(x => x.id === a.questionId);
                  const opt = q?.options.find(o => o.id === a.optionId);
                  if (!q || !opt) return null;
                  return (
                    <div
                      key={idx}
                      className="mb-2 border-l-4 border-indigo-500 bg-gray-50 p-3 rounded"
                    >
                      <p className="font-medium">{q.questionText}</p>
                      <p className="mt-1 text-indigo-600">
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
