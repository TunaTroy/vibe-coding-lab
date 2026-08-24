import React from 'react';

function MultipleChoiceQuestion({ question, onAnswer, selectedAnswer }) {
  const options = question.payload?.options || [];

  return (
    <div className="space-y-3">
      <p className="text-lg font-medium text-gray-800">{question.prompt}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedAnswer === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={index}
              checked={selectedAnswer === index}
              onChange={() => onAnswer(index)}
              className="mr-3"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default MultipleChoiceQuestion;
