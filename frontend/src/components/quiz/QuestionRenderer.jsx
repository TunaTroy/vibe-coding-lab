import React from 'react';
import MultipleChoiceQuestion from './types/MultipleChoiceQuestion';

function QuestionRenderer({ question, onAnswer, selectedAnswer }) {
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      return (
        <MultipleChoiceQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
        />
      );
    case 'FILL_BLANK':
    case 'MATCHING':
    case 'CLOZE':
    case 'TRUE_FALSE_NOT_GIVEN':
      return (
        <div className="p-4 bg-[#DAA520]/10 border border-[#DAA520]/30 rounded-lg">
          <p className="text-[#DAA520] font-semibold">
            Loại câu hỏi "{question.type}" chưa được triển khai.
          </p>
        </div>
      );
    default:
      return (
        <div className="p-4 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-lg">
          <p className="text-[#C8102E] font-semibold">Loại câu hỏi không xác định: {question.type}</p>
        </div>
      );
  }
}

export default QuestionRenderer;
