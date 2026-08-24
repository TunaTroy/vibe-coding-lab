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
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Question type "{question.type}" is not yet implemented.
          </p>
        </div>
      );
    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Unknown question type: {question.type}</p>
        </div>
      );
  }
}

export default QuestionRenderer;
