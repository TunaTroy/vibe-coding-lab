import QuestionRenderer from "../quiz/QuestionRenderer";

function answerText(question, answer) {
  if (answer === null || answer === undefined) return "";
  switch (question.type) {
    case "MULTIPLE_CHOICE": return question.payload?.options?.[answer] ?? "";
    case "FILL_BLANK": return String(answer);
    case "MATCHING": return question.payload?.left?.map((part, i) => `${part} → ${question.payload?.right?.[answer[i]] ?? "?"}`).join(" · ") ?? "";
    case "CLOZE": return question.payload?.segments?.map((part, i) => `${part}${i < answer.length ? question.payload?.bank?.[answer[i]] ?? "?" : ""}`).join("") ?? "";
    case "TRUE_FALSE_NOT_GIVEN": return ({ TRUE: "Đúng", FALSE: "Sai", NOT_GIVEN: "Không đề cập" })[answer] ?? "";
    default: return "";
  }
}

export function canConfirmAnswer(question, answer) {
  if (!question) return false;
  switch (question.type) {
    case "MULTIPLE_CHOICE": return Number.isInteger(answer) && answer >= 0;
    case "FILL_BLANK": return typeof answer === "string" && answer.trim().length > 0;
    case "MATCHING": return Array.isArray(answer) && answer.length === (question.payload?.left?.length ?? 0) && answer.every(Number.isInteger);
    case "CLOZE": return Array.isArray(answer) && answer.length === Math.max(0, (question.payload?.segments?.length ?? 0) - 1) && answer.every(Number.isInteger);
    case "TRUE_FALSE_NOT_GIVEN": return ["TRUE", "FALSE", "NOT_GIVEN"].includes(answer);
    default: return false;
  }
}

export default function BattleQuestion({ question, selected, onSelect, onConfirm, feedback, feedbackReady, onContinue, submitting, error }) {
  const frozen = submitting || Boolean(feedback);
  return (
    <section className={`battle-question ${feedback ? `battle-question--${feedback.isCorrect ? "correct" : "incorrect"}` : ""}`} aria-label={`Câu hỏi ${question.position}`}>
      <div className="battle-question__head">
        <div className="battle-question__crest" aria-hidden><svg viewBox="0 0 32 32" fill="none"><path d="M16 2 28 7v9c0 7-5 12-12 14C9 28 4 23 4 16V7Z" stroke="currentColor" strokeWidth="2" /><path d="M10 12q3-1 6 1 3-2 6-1v9q-3-1-6 1-3-2-6-1Z" fill="currentColor" /><path d="M16 13v9" stroke="#1b1a14" strokeWidth="1.4" /></svg></div>
        <div><p className="battle-question__eyebrow">THỬ THÁCH TRÊN SÂN</p><p className="battle-question__sub">Trả lời đúng để tung đòn vào Boss</p></div>
        <span className="battle-question__number">#{String(question.position).padStart(2, "0")}</span>
      </div>

      <div className="battle-question__content">
        <QuestionRenderer question={question} selected={selected} locked={frozen} onSelect={onSelect} draftMode feedback={feedback} />
      </div>

      {feedback && (
        <div className={`battle-learning-feedback ${feedback.isCorrect ? "battle-learning-feedback--correct" : "battle-learning-feedback--wrong"}`} role="status" aria-live="polite">
          <span className="battle-learning-feedback__symbol" aria-hidden>{feedback.isCorrect ? "✓" : "×"}</span>
          <div>
            <strong>{feedback.isCorrect ? "TUYỆT VỜI!" : "SUÝT ĐÚNG RỒI!"}</strong>
            {!feedback.isCorrect && <p>Đáp án đúng: <b>{answerText(question, feedback.correctAnswer)}</b></p>}
            <p>{feedback.explanation}</p>
          </div>
        </div>
      )}

      {error && <div className="battle-question__error" role="alert"><strong>Chưa gửi được đáp án.</strong> {error} Đáp án của bạn vẫn được giữ.</div>}

      <div className="battle-question__footer">
        <div className="battle-question__hint">{feedback ? "Hãy đọc lời giải trước khi tiếp tục nhé." : "Chọn đáp án rồi nhấn Xác nhận."}</div>
        {feedback ? (
          !feedback.result && <button className="battle-action battle-action--continue" type="button" onClick={onContinue} disabled={!feedbackReady}>CÂU TIẾP THEO <span aria-hidden>→</span></button>
        ) : (
          <button className="battle-action" type="button" onClick={onConfirm} disabled={!canConfirmAnswer(question, selected) || submitting}>
            {submitting ? "ĐANG CHẤM..." : "XÁC NHẬN ĐÁP ÁN"} <span aria-hidden>{submitting ? "◌" : "→"}</span>
          </button>
        )}
      </div>
    </section>
  );
}
