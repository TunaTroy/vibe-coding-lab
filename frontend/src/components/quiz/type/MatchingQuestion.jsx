import { useState } from "react";

/* ============================================================
   MATCHING — payload: { left: string[], right: string[] }
   answer gửi lên: number[] — answer[i] = index trong "right"
   mà user ghép với left[i]. correctAnswer: number[] cùng độ dài.
   User chọn từng cặp qua <select>, được ĐỔI thoải mái khi chưa
   đủ cặp; khi TẤT CẢ cặp đã chọn → onSelect(mảng) →
   PlayLevelPage khoá câu hỏi (không sửa được nữa).
   ============================================================ */

export default function MatchingQuestion({ question, selected, locked, onSelect }) {
  const left = question.payload?.left ?? [];
  const right = question.payload?.right ?? [];

  const [picks, setPicks] = useState(() =>
    Array.isArray(selected) ? [...selected] : Array(left.length).fill(null)
  );

  const handlePick = (i, value) => {
    if (locked) return;
    const next = [...picks];
    next[i] = value === "" ? null : Number(value);
    setPicks(next);

    // Chỉ commit khi đã ghép đủ mọi cặp — trước đó user được sửa tự do
    if (next.every((p) => p !== null)) onSelect(next);
  };

  return (
    <div className="anim-rise">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-cream leading-snug">
        {question.prompt}
      </h2>
      <p className="mt-2 text-sm text-cream/60">
        Ghép mỗi chủ ngữ bên trái với động từ đúng bên phải — chọn đủ {left.length} cặp để khoá đáp án.
      </p>

      <div className="mt-6 space-y-3">
        {left.map((subject, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="sm:w-44 shrink-0 rounded-xl border-2 border-gold/25 bg-pitch/50 px-4 py-2.5 font-bold text-cream">
              {subject}
            </span>
            <span className="hidden sm:block font-mono text-sm text-gold-deep" aria-hidden>→</span>
            <select
              value={picks[i] === null ? "" : picks[i]}
              disabled={locked}
              onChange={(e) => handlePick(i, e.target.value)}
              aria-label={`Động từ cho ${subject}`}
              className={`flex-1 rounded-xl border-2 px-4 py-2.5 font-semibold outline-none transition-all duration-200
                disabled:opacity-60
                ${
                  picks[i] !== null
                    ? "border-gold-bright bg-gold/15 text-gold-bright"
                    : "border-gold/25 bg-pitch/50 text-cream/70 hover:border-gold/60"
                }`}
            >
              <option value="" disabled>— chọn động từ —</option>
              {right.map((verb, vi) => (
                <option key={vi} value={vi}>
                  {verb}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
