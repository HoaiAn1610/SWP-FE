import React from "react";

const QuestionCard = ({ question, onAnswer, selectedAnswer }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {question.questionText}
      </h3>
      <div className="space-y-2">
        {question.options.map((opt) => (
          <div key={opt.id} className="flex items-center">
            <input
              type="radio"
              id={`q${question.id}-opt${opt.id}`}
              name={`question-${question.id}`}
              value={opt.id}
              checked={selectedAnswer === opt.id}
              onChange={() => onAnswer(opt.id)}  
              className="mr-2"
            />
            <label htmlFor={`q${question.id}-opt${opt.id}`} className="text-gray-700">
              {opt.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
