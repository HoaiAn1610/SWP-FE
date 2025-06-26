// src/components/home/SurveySection.jsx
import React from "react";
import { FiFileText, FiZap, FiBarChart2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function SurveySection() {
  const navigate = useNavigate();
  const startSurvey = () => {
    // chuyển đến route survey hoặc mở modal survey
    navigate("/survey");
  };

  return (
    <section
      id="survey"
      className="py-16 bg-gradient-to-r from-indigo-500 to-blue-400"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-2">
          Take Your Prevention Survey
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Get personalized insights about your risk factors and receive
          customized recommendations for prevention strategies that work best
          for you.
        </p>
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex flex-col items-center">
            <FiFileText size={32} className="text-indigo-500 mb-2" />
            <span className="font-medium">Quick Survey</span>
            <span className="text-sm text-gray-500">
              Complete in just 10 minutes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <FiZap size={32} className="text-indigo-500 mb-2" />
            <span className="font-medium">Instant Results</span>
            <span className="text-sm text-gray-500">
              Get immediate feedback
            </span>
          </div>
          <div className="flex flex-col items-center">
            <FiBarChart2 size={32} className="text-indigo-500 mb-2" />
            <span className="font-medium">Personalized Plan</span>
            <span className="text-sm text-gray-500">
              Tailored recommendations
            </span>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={startSurvey}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-8 py-3 rounded-full transition"
          >
            Start Survey Now
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          100% confidential and secure
        </p>
      </div>
    </section>
  );
}
