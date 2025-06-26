// src/pages/auth/course/QuizPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import QuestionCard from "@/components/courses/QuestionCard";

export default function QuizPage() {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  // trạng thái chung
  const [questions, setQuestions]       = useState([]);
  const [answers, setAnswers]           = useState({});   // lưu đáp án đang chọn trước khi submit
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sau khi submit xong
  const [result, setResult]             = useState(null);
  // result = { id: submissionId, score, total, passedStatus }

  // Chi tiết submission
  const [submissionDetail, setSubmissionDetail] = useState(null);

  // 1) Lấy quiz questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${courseId}/Quiz/get-quiz`);
        const mapped = res.data.map(q => ({
          id:           q.questionId,
          questionText: q.questionText,
          options:      (q.options || []).map(o => ({
            id:   o.id,
            text: o.optionText
          }))
        }));
        setQuestions(mapped);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Không thể tải quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [courseId]);

  // 2) Chọn đáp án
  const handleAnswer = (questionId, optionId) => {
    setAnswers(a => ({ ...a, [questionId]: optionId }));
  };

  // 3) Next / Submit
  const handleNext = async () => {
    const isLast = currentIndex === questions.length - 1;
    if (!isLast) {
      setCurrentIndex(i => i + 1);
      return;
    }
    // payload cho api submit
    const payload = questions.map(q => ({
      questionId: q.id,
      optionId:   answers[q.id]
    }));
    try {
      setLoading(true);
      const res = await api.post(
        `/courses/${courseId}/Quiz/submit-answers`,
        payload
      );
      // API trả về { id, score, total?, passedStatus }
      const { id, score, passedStatus } = res.data;
      const total = res.data.total ?? questions.length;
      setResult({ id, score, total, passedStatus });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Submit thất bại");
    } finally {
      setLoading(false);
    }
  };

  // 4) Khi có result, lấy chi tiết submission để đưa xuống rendering
  useEffect(() => {
    if (!result) return;
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/quiz/submissions/${result.id}`);
        // res.data.answers = [{ questionId, optionId, scoreValue }, ...]
        setSubmissionDetail(res.data);
      } catch (err) {
        console.error("Không lấy được chi tiết submission:", err);
      }
    };
    fetchDetail();
  }, [result]);

  // 5) Loading / lỗi
  if (loading) return <p className="text-center py-10">Loading quiz…</p>;
  if (error)   return <p className="text-center text-red-500 py-10">{error}</p>;

  // 6) Khi đã submit xong, hiển thị kết quả + chi tiết
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
          {/* Header kết quả */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold">Quiz Completed!</h1>
            <p className="text-lg">
              Your score:{" "}
              <span className="font-bold text-indigo-600">{result.score}</span> /{" "}
              <span className="font-bold text-indigo-600">{result.total}</span>
            </p>
            <p className={`text-2xl font-bold ${
              result.passedStatus ? "text-green-600" : "text-red-600"
            }`}>
              {result.passedStatus ? "You Passed! 🎉" : "Not Passed. 😔"}
            </p>
          </div>

          {/* Detailed Results */}
          {submissionDetail?.answers && (
            <div className="bg-white p-6 rounded-lg shadow-lg divide-y divide-gray-200">
              <h2 className="text-xl font-semibold mb-4">Detailed Results</h2>
              {questions.map((q, idx) => {
                const detail = submissionDetail.answers.find(
                  a => a.questionId === q.id
                );
                return (
                  <div key={q.id} className="py-4">
                    {/* Câu hỏi */}
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {idx + 1}. {q.questionText}
                    </h3>
                    {/* Tất cả các option */}
                    <ul className="space-y-2">
                      {q.options.map(o => {
                        const isChosen = detail.optionId === o.id;
                        const correct  = detail.scoreValue === 1;
                        const borderColor = isChosen
                          ? (correct ? "border-green-500" : "border-red-500")
                          : "border-transparent";
                        const bgColor = isChosen
                          ? (correct ? "bg-green-50"     : "bg-red-50")
                          : "bg-gray-50 hover:bg-gray-100";
                        const textColor = isChosen
                          ? (correct ? "text-green-800"   : "text-red-800")
                          : "text-gray-700";

                        return (
                          <li
                            key={o.id}
                            className={`
                              border-l-4 ${borderColor}
                              ${bgColor} ${textColor}
                              px-4 py-2 rounded-md flex items-center transition
                            `}
                          >
                            {/* {isChosen && (
                              <span className="inline-block mr-2">
                                {correct ? "✅" : "❌"}
                              </span>
                            )} */}
                            <span>{o.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <button
              onClick={() => navigate(`/course/${courseId}/lesson`)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Lesson
            </button>
            <button
              onClick={() => navigate("/course")}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7) render câu hỏi hiện tại
  const current = questions[currentIndex];
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <h1 className="text-2xl font-semibold">
          Quiz – Question {currentIndex + 1} of {questions.length}
        </h1>
        <QuestionCard
          question={current}
          selectedAnswer={answers[current.id]}
          onAnswer={optId => handleAnswer(current.id, optId)}
        />
        <div className="text-right">
          <button
            onClick={handleNext}
            disabled={answers[current.id] == null}
            className={`px-6 py-2 rounded ${
              answers[current.id] != null
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {currentIndex < questions.length - 1 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
