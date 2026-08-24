import React from 'react';

function MultipleChoiceQuestion({ question, onAnswer, selectedAnswer }) {
  const options = question.payload?.options || [];

  return (
    <div className="space-y-4">
      <p className="text-lg font-bold text-[#F4E9CE] leading-relaxed">{question.prompt}</p>
      <div className="space-y-3">
        {options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedAnswer === index
                ? 'border-[#DAA520] bg-gradient-to-r from-[#DAA520]/20 to-[#FFD700]/20 shadow-[0_0_12px_rgba(218,165,32,0.3)]'
                : 'border-[#F0C040]/30 bg-[#1a1a1a]/50 hover:border-[#F0C040]/60 hover:bg-[#1a1a1a]/70'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={index}
              checked={selectedAnswer === index}
              onChange={() => onAnswer(index)}
              className="mr-3 h-4 w-4 text-[#DAA520] focus:ring-[#F0C040]/50 bg-[#1a1a1a] border-[#F0C040]/50"
            />
            <span className={`font-medium ${selectedAnswer === index ? 'text-[#FFD700]' : 'text-[#F4E9CE]/80'}`}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default MultipleChoiceQuestion;
