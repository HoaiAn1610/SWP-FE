// src/pages/auth/course/QuizPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import api from "@/config/axios";
import QuestionCard from "@/components/courses/QuestionCard";

const QuizPage = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [questions, setQuestions]           = useState([]);
  const [answers, setAnswers]               = useState({}); // { [questionId]: selectedOptionId }
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [result, setResult]                 = useState(null); // { score, total }

  // 1) Lấy câu hỏi khi component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${courseId}/Quiz/get-quiz`);
        // Giả sử res.data = [ { questionId, questionText, options: [{ id, optionText },…] }, … ]
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

  // 2) Xử lý chọn đáp án
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

    // Nếu là câu cuối thì submit lên server để lấy điểm
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
      // Giả sử API trả về { score: 3, total: 10 }
      setResult({
        score: res.data.score,
        total: res.data.total ?? questions.length
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Submit thất bại");
    } finally {
      setLoading(false);
    }
  };

  // 4) Render loading / error
  if (loading) return <p className="text-center py-10">Loading quiz...</p>;
  if (error)   return <p className="text-center text-red-500 py-10">{error}</p>;

  // 5) Nếu đã có kết quả
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto py-8 px-4 text-center space-y-6">
          <h1 className="text-2xl font-semibold">Quiz Completed!</h1>
          <p className="text-lg">
            Your score:{" "}
            <span className="font-bold text-indigo-600">{result.score}</span>{" "}
            /{" "}
            <span className="font-bold text-indigo-600">{result.total}</span>
          </p>
          <button
            onClick={() => navigate("/course")}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // 6) Render câu hỏi hiện tại
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
            className={`
              px-6 py-2 rounded 
              ${answers[current.id] != null
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"}
            `}
          >
            {currentIndex < questions.length - 1 ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
