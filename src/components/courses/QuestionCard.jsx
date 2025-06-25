import React from "react";

const QuestionCard = ({ question, onAnswer, selectedAnswer }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {question.questionText}
      </h3>
      <div className="space-y-3">
        {question.options.map(opt => (
          <div key={opt.id}>
            <input
              type="radio"
              id={`q${question.id}-opt${opt.id}`}
              name={`question-${question.id}`}
              value={opt.id}
              checked={selectedAnswer === opt.id}
              onChange={() => onAnswer(opt.id)}
              className="hidden peer"
            />
            <label
              htmlFor={`q${question.id}-opt${opt.id}`}
              className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors peer-checked:border-indigo-600 peer-checked:bg-indigo-100"
            >
              <span
                className="w-5 h-5 mr-3 flex-shrink-0 border-2 border-gray-400 rounded-full peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-colors"
              />
              <span className="text-gray-700 peer-checked:text-indigo-900">
                {opt.text}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
