// src/pages/survey/AssistSurveyPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";

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

  // Load questions and group
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/surveys/5/submissions/get-questions`);
        const map = new Map();
        res.data.forEach(q => {
          if (!map.has(q.substanceId)) {
            map.set(q.substanceId, { id: q.substanceId, name: q.substanceName, questions: [] });
          }
          map.get(q.substanceId).questions.push(q);
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
    }
    load();
  }, [surveyId]);

  // Advance to next group when questions exhausted
  useEffect(() => {
    if (!groups.length) return;
    const group = groups[subIndex];
    if (group && qIndex >= group.questions.length) {
      setSubIndex(i => i + 1);
      setQIndex(0);
    }
  }, [qIndex, groups, subIndex]);

  // Submit answers when all groups done
  useEffect(() => {
    if (groups.length && subIndex >= groups.length) {
      (async () => {
        try {
          const payload = answers.map(a => ({ questionId: a.questionId, optionId: a.optionId }));
          const res = await api.post(`/surveys/5/submissions/submit`, payload);
          setSubmissionId(res.data.id);
        } catch (e) {
          setError(e.response?.data?.message || e.message);
        }
      })();
    }
  }, [subIndex, groups, answers, surveyId]);

  // Fetch submission detail
  useEffect(() => {
    if (!submissionId) return;
    api.get(`/surveys/5/submissions/${submissionId}`)
      .then(({ data }) => setSubmissionDetail(data))
      .catch(console.error);
  }, [submissionId, surveyId]);

  // Handle answer selection
  const handleAnswer = opt => {
    const group = groups[subIndex];
    const current = group.questions[qIndex];
    setAnswers(a => [...a, { questionId: current.id, optionId: opt.id }]);
    if (current.sequence === 1 && opt.scoreValue === 0) {
      setSubIndex(i => i + 1);
      setQIndex(0);
    } else {
      setQIndex(i => i + 1);
    }
  };

  // Recommendations by risk level
  const getRecommendationsByRisk = level => {
    switch (level) {
      case "Low":
        return "Bạn có mức rủi ro thấp. Tham khảo các khóa cơ bản về phòng ngừa và nâng cao sức khỏe.";
      case "Medium":
        return "Bạn có mức rủi ro trung bình. Mời tham gia khoá tư vấn trực tuyến hoặc workshop giảm sử dụng.";
      case "High":
        return "Bạn có mức rủi ro cao. Vui lòng đặt lịch tư vấn cá nhân ngay với chuyên gia.";
      default:
        return "";
    }
  };

  // Render states
  if (loading) return <p className="text-center py-10">Đang tải khảo sát…</p>;
  if (error)   return <p className="text-center text-red-500 py-10">{error}</p>;

  // If detail loaded, show summary + detail toggle
  if (submissionDetail) {
    const { score, riskLevel, recommendation, answers: ansList } = submissionDetail;
    // build flat map of questions
    const flatMap = {};
    groups.forEach(g => g.questions.forEach(q => flatMap[q.id] = { ...q, substanceName: g.name }));
    // group answers by substance
    const groupedAns = ansList.reduce((acc, a) => {
      const q = flatMap[a.questionId];
      if (!acc[q.substanceName]) acc[q.substanceName] = [];
      acc[q.substanceName].push({ questionText: q.questionText, optionText: q.options.find(o => o.id === a.optionId)?.optionText });
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold mb-4">Kết quả Khảo sát</h1>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="font-medium">Score:</dt>
                <dd>{score}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Risk Level:</dt>
                <dd>{riskLevel}</dd>
              </div>
              <div>
                <dt className="font-medium">Recommendation:</dt>
                <dd className="mt-1 text-gray-700">{recommendation}</dd>
              </div>
              <div>
                <dt className="font-medium">Gợi ý thêm:</dt>
                <dd className="mt-1 text-indigo-600">{getRecommendationsByRisk(riskLevel)}</dd>
              </div>
            </dl>
          </div>

          <button
            onClick={() => setShowDetail(d => !d)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow"
          >
            {showDetail ? "Ẩn chi tiết bài làm" : "Xem chi tiết bài làm"}
          </button>

          {showDetail && (
            <div className="space-y-6">
              {Object.entries(groupedAns).map(([subName, items]) => (
                <div key={subName} className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4">{subName}</h2>
                  <ul className="space-y-4">
                    {items.map((it, idx) => (
                      <li key={idx} className="border-l-4 border-indigo-500 bg-gray-50 p-4 rounded">
                        <p className="font-medium">{it.questionText}</p>
                        <p className="mt-1 text-indigo-600">Lựa chọn của bạn: {it.optionText}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
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
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold mb-2">{group.name} – Câu hỏi {current.sequence}</h1>
          <p className="text-gray-700 mb-4">{current.questionText}</p>
          <div className="space-y-3">
            {current.options.map(opt => (
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
