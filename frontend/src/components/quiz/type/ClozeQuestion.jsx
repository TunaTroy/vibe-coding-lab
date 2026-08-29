import { useState } from "react";

/* ============================================================
   CLOZE — ngân hàng từ (Vấn đề 3b [14]), KHÔNG dùng dropdown.
   payload MỚI: { segments: string[], bank: string[] }
     (segments.length - 1 = số chỗ trống; bank gồm đáp án đúng +
      từ nhiễu, đã trộn). BỎ field "blanks" kiểu cũ.
   answer gửi lên: number[] — mỗi phần tử là INDEX TRONG "bank"
   (mảng gốc, KHÔNG phải vị trí hiển thị) cho từng chỗ trống theo
   thứ tự. correctAnswer: number[] cùng độ dài.

   Tương tác:
   - Chạm 1 từ trong ngân hàng → "cầm" từ (highlight) → chạm 1 ô
     trống → từ điền vào ô (biến mất khỏi ngân hàng).
   - (Hoặc chạm ô trống trước rồi chạm từ — đều được.)
   - Chạm lại ô đã điền → trả từ về ngân hàng để chọn lại.
   - Khi TẤT CẢ ô đã điền → onSelect(number[]) → khoá.
   ============================================================ */

function shuffleIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ClozeQuestion({ question, selected, locked, onSelect }) {
  const segments = question.payload?.segments ?? [];
  const bank = question.payload?.bank ?? [];
  const numBlanks = Math.max(0, segments.length - 1);

  // choices[i] = index gốc trong bank cho chỗ trống i (null = trống)
  const [choices, setChoices] = useState(() =>
    Array.isArray(selected) && selected.length === numBlanks ? [...selected] : Array(numBlanks).fill(null)
  );
  // Thứ tự hiển thị ngân hàng: xáo trộn 1 lần, lưu INDEX GỐC
  const [displayOrder] = useState(() => shuffleIndices(bank.length));
  // Đang "cầm": { kind: 'word'|'blank', index } hoặc null
  const [held, setHeld] = useState(null);

  const usedWords = new Set(choices.filter((c) => c !== null));

  const commitIfComplete = (next) => {
    if (next.every((c) => c !== null)) onSelect(next);
  };

  const handleTapWord = (originalIndex) => {
    if (locked || usedWords.has(originalIndex)) return;

    if (held && held.kind === "blank") {
      // Đã chọn ô trước → điền từ vào ô đó
      const next = [...choices];
      next[held.index] = originalIndex;
      setChoices(next);
      setHeld(null);
      commitIfComplete(next);
    } else {
      setHeld({ kind: "word", index: originalIndex });
    }
  };

  const handleTapBlank = (blankIndex) => {
    if (locked) return;

    if (held && held.kind === "word") {
      // Đã cầm từ → điền vào ô này
      const next = [...choices];
      next[blankIndex] = held.index;
      setChoices(next);
      setHeld(null);
      commitIfComplete(next);
    } else if (choices[blankIndex] !== null) {
      // Ô đã điền → trả từ về ngân hàng
      const next = [...choices];
      next[blankIndex] = null;
      setChoices(next);
      setHeld(null);
    } else {
      // Ô trống → chọn ô, chờ chạm từ
      setHeld({ kind: "blank", index: blankIndex });
    }
  };

  return (
    <div className="anim-rise">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-cream leading-snug">
        {question.prompt}
      </h2>

      {/* Đoạn văn với các ô trống */}
      <p className="mt-5 text-lg sm:text-xl leading-loose font-medium text-cream">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < numBlanks && (
              <button
                type="button"
                disabled={locked}
                onClick={() => handleTapBlank(i)}
                aria-label={`Chỗ trống số ${i + 1}`}
                className={`mx-1 inline-block min-w-[96px] rounded-lg border-2 px-3 py-1 text-center font-bold align-middle transition-all duration-200
                  ${
                    choices[i] !== null
                      ? "border-gold-bright bg-gold/15 text-gold-bright"
                      : held && held.kind === "blank" && held.index === i
                      ? "border-gold-bright bg-gold/25 text-gold-bright shadow-[0_0_14px_rgba(255,215,0,0.3)]"
                      : "border-gold/30 bg-pitch/60 text-cream/40 hover:border-gold/70"
                  }`}
              >
                {choices[i] !== null ? bank[choices[i]] : "…"}
              </button>
            )}
          </span>
        ))}
      </p>

      {/* Ngân hàng từ */}
      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-deep mb-3">
          Ngân hàng từ · chạm từ rồi chạm ô trống
        </p>
        <div className="flex flex-wrap gap-2.5">
          {displayOrder.map((originalIndex) => {
            const used = usedWords.has(originalIndex);
            const isHeld = held && held.kind === "word" && held.index === originalIndex;
            return (
              <button
                key={originalIndex}
                type="button"
                disabled={locked || used}
                onClick={() => handleTapWord(originalIndex)}
                className={`rounded-xl border-2 px-4 py-2 font-bold transition-all duration-200
                  ${
                    used
                      ? "border-gold/10 bg-pitch/30 text-cream/25 line-through cursor-not-allowed"
                      : isHeld
                      ? "border-gold-bright bg-gold/25 text-gold-bright shadow-[0_0_16px_rgba(255,215,0,0.3)] -translate-y-0.5"
                      : "border-gold/25 bg-pitch/50 text-cream hover:border-gold-bright hover:bg-gold/15 hover:text-gold-bright hover:-translate-y-0.5"
                  }`}
              >
                {bank[originalIndex]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
