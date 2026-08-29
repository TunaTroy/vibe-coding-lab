import { useState } from "react";

/* ============================================================
   CLOZE — payload: { segments: string[], blanks: [{options: string[]}] }
   segments.length - 1 = blanks.length. Đoạn văn render xen kẽ:
   segments[0] + blank0 + segments[1] + blank1 + ...
   answer gửi lên: number[] — index đã chọn cho từng blank, theo
   đúng thứ tự. Gọi onSelect KHI TẤT CẢ blank đã chọn.
   ============================================================ */

export default function ClozeQuestion({ question, selected, locked, onSelect }) {
  const segments = question.payload?.segments ?? [];
  const blanks = question.payload?.blanks ?? [];

  const [choices, setChoices] = useState(() =>
    Array.isArray(selected) ? [...selected] : Array(blanks.length).fill(null)
  );

  const handleChoose = (i, value) => {
    if (locked) return;
    const next = [...choices];
    next[i] = value === "" ? null : Number(value);
    setChoices(next);

    // Chỉ commit khi đã chọn đủ mọi chỗ trống
    if (next.every((c) => c !== null)) onSelect(next);
  };

  return (
    <div className="anim-rise">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-cream leading-snug">
        {question.prompt}
      </h2>

      <p className="mt-5 text-lg sm:text-xl leading-loose font-medium text-cream">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < blanks.length && (
              <select
                value={choices[i] === null ? "" : choices[i]}
                disabled={locked}
                onChange={(e) => handleChoose(i, e.target.value)}
                aria-label={`Chỗ trống số ${i + 1}`}
                className={`mx-1 inline-block min-w-[96px] rounded-lg border-2 px-2 py-1 text-center font-bold
                  outline-none transition-all duration-200 disabled:opacity-60
                  ${
                    choices[i] !== null
                      ? "border-gold-bright bg-gold/15 text-gold-bright"
                      : "border-gold/30 bg-pitch/60 text-cream/60 hover:border-gold/70"
                  }`}
              >
                <option value="" disabled>…</option>
                {blanks[i].options.map((opt, oi) => (
                  <option key={oi} value={oi}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </span>
        ))}
      </p>

      <p className="mt-4 font-mono text-xs text-gold-deep">
        Chọn đủ {blanks.length} chỗ trống để khoá đáp án.
      </p>
    </div>
  );
}
