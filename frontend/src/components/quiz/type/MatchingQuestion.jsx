import { useState } from "react";

/* ============================================================
   MATCHING — chạm-để-nối (Vấn đề 3a [14]), KHÔNG dùng dropdown.
   payload: { left: string[], right: string[] }
   answer gửi lên: number[] — answer[i] = index trong "right"
   ghép với left[i]. correctAnswer: number[] cùng độ dài.

   Tương tác:
   - Chạm 1 chủ ngữ (trái) → highlight "đang chọn".
   - Chạm 1 động từ (phải) → tạo cặp với chủ ngữ đang chọn (đổi
     màu + ✓), rồi tự chuyển sang chủ ngữ chưa nối kế tiếp.
   - Chạm lại 1 cặp đã nối → chọn lại chủ ngữ đó để nối lại.
   - Động từ bên phải DÙNG LẠI được (không biến mất) vì contract
     cho phép trùng index.
   - Khi TẤT CẢ chủ ngữ đã nối → onSelect(number[]) → khoá.
   ============================================================ */

export default function MatchingQuestion({ question, selected, locked, onSelect }) {
  const left = question.payload?.left ?? [];
  const right = question.payload?.right ?? [];

  const [picks, setPicks] = useState(() =>
    Array.isArray(selected) ? [...selected] : Array(left.length).fill(null)
  );
  // Chủ ngữ đang được chọn để nối (mặc định: ô trống đầu tiên)
  const [activeLeft, setActiveLeft] = useState(() => {
    if (Array.isArray(selected)) return null;
    return 0;
  });

  const nextEmpty = (arr) => {
    const idx = arr.findIndex((p) => p === null);
    return idx === -1 ? null : idx;
  };

  const handlePickLeft = (i) => {
    if (locked) return;
    setActiveLeft(i);
  };

  const handlePickRight = (rightIndex) => {
    if (locked || activeLeft === null) return;

    const next = [...picks];
    next[activeLeft] = rightIndex;
    setPicks(next);

    // Chuyển sang chủ ngữ chưa nối kế tiếp
    const upcoming = nextEmpty(next);
    setActiveLeft(upcoming);

    // Đã nối đủ mọi cặp → commit (PlayLevelPage sẽ khoá câu hỏi)
    if (upcoming === null) onSelect(next);
  };

  const isPaired = (i) => picks[i] !== null;

  return (
    <div className="anim-rise">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-cream leading-snug">
        {question.prompt}
      </h2>
      <p className="mt-2 text-sm text-cream/60">
        Chạm một <span className="text-gold-bright">chủ ngữ</span>, rồi chạm <span className="text-gold-bright">động từ</span> đúng
        để nối. Chạm lại cặp đã nối để đổi.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Cột trái — chủ ngữ */}
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-deep">Chủ ngữ</p>
          {left.map((subject, i) => {
            const paired = isPaired(i);
            const active = activeLeft === i && !locked;
            return (
              <button
                key={i}
                type="button"
                disabled={locked}
                onClick={() => handlePickLeft(i)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left font-bold transition-all duration-200 disabled:opacity-70
                  ${
                    active
                      ? "border-gold-bright bg-gold/20 text-gold-bright shadow-[0_0_16px_rgba(255,215,0,0.25)] -translate-y-0.5"
                      : paired
                      ? "border-gold/60 bg-gold/10 text-cream"
                      : "border-gold/25 bg-pitch/50 text-cream/80 hover:border-gold/60 hover:-translate-y-0.5"
                  }`}
              >
                <span>{subject}</span>
                {paired ? (
                  <span className="flex items-center gap-1.5 font-mono text-sm text-gold-bright">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7.5 5.5 11 12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {right[picks[i]]}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-cream/40">{active ? "chọn động từ →" : "chưa nối"}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cột phải — động từ (dùng lại được) */}
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-deep">Động từ</p>
          <div className="flex flex-col gap-3">
            {right.map((verb, vi) => (
              <button
                key={vi}
                type="button"
                disabled={locked || activeLeft === null}
                onClick={() => handlePickRight(vi)}
                className={`rounded-xl border-2 px-4 py-3 text-center font-bold transition-all duration-200
                  ${
                    locked || activeLeft === null
                      ? "border-gold/20 bg-pitch/40 text-cream/50"
                      : "border-gold/25 bg-pitch/50 text-cream hover:border-gold-bright hover:bg-gold/15 hover:text-gold-bright hover:-translate-y-0.5 cursor-pointer"
                  }`}
              >
                {verb}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
