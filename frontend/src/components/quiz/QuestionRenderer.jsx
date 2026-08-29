import ClozeQuestion from "./type/ClozeQuestion";
import FillBlankQuestion from "./type/FillBlankQuestion";
import MatchingQuestion from "./type/MatchingQuestion";
import MultipleChoiceQuestion from "./type/MultipleChoiceQuestion";
import TrueFalseNotGivenQuestion from "./type/TrueFalseNotGivenQuestion";



/* ============================================================
   QuestionRenderer — DISPATCHER theo question.type (enum
   QuestionType trong prisma/schema.prisma).
   Props interface GIỮ NGUYÊN: (question, selected, locked, onSelect)
   vì PlayLevelPage.jsx đang gọi đúng 4 props này — không đổi.

   Contract answer (khớp backend submitLevel — so sánh bằng
   JSON.stringify, correctAnswer CHỈ là string/number/mảng phẳng):
   - MULTIPLE_CHOICE:      number   — index trong payload.options
   - FILL_BLANK:           string   — đã trim().toLowerCase()
   - MATCHING:             number[] — answer[i] = index trong payload.right
   - CLOZE:                number[] — index đã chọn cho từng blank
   - TRUE_FALSE_NOT_GIVEN: "TRUE" | "FALSE" | "NOT_GIVEN"

   key={question.id} để animation chạy lại khi chuyển giữa 2 câu
   cùng loại.
   ============================================================ */

const RENDERERS = {
  MULTIPLE_CHOICE: MultipleChoiceQuestion,
  FILL_BLANK: FillBlankQuestion,
  MATCHING: MatchingQuestion,
  CLOZE: ClozeQuestion,
  TRUE_FALSE_NOT_GIVEN: TrueFalseNotGivenQuestion,
};

export default function QuestionRenderer({ question, selected, locked, onSelect }) {
  const Renderer = RENDERERS[question.type] ?? MultipleChoiceQuestion;
  return (
    <Renderer
      key={question.id}
      question={question}
      selected={selected}
      locked={locked}
      onSelect={onSelect}
    />
  );
}
