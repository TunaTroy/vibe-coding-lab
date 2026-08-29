/* ============================================================
   TRUE_FALSE_NOT_GIVEN — payload: { passage: string, statement: string }
   answer gửi lên: string — "TRUE" | "FALSE" | "NOT_GIVEN"
   (đúng 3 giá trị này, khớp correctAnswer trong DB).
   ============================================================ */

const OPTIONS = [
  { value: "TRUE", label: "TRUE", sub: "Đúng" },
  { value: "FALSE", label: "FALSE", sub: "Sai" },
  { value: "NOT_GIVEN", label: "NOT GIVEN", sub: "Không đề cập" },
];

export default function TrueFalseNotGivenQuestion({ question, selected, locked, onSelect }) {
  const passage = question.payload?.passage ?? "";
  const statement = question.payload?.statement ?? "";

  return (
    <div className="anim-rise">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-cream leading-snug">
        {question.prompt}
      </h2>

      <blockquote className="mt-5 rounded-xl border-2 border-gold/20 bg-pitch/40 px-5 py-4 text-base sm:text-lg leading-relaxed text-cream/90 italic">
        “{passage}”
      </blockquote>

      <p className="mt-4 text-base sm:text-lg font-semibold text-cream">
        Nhận định: <span className="text-gold-bright">“{statement}”</span>
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          const stateClass = isSelected
            ? "border-gold-bright bg-gold/20 text-gold-bright shadow-[0_0_18px_rgba(255,215,0,0.2)]"
            : "border-gold/25 bg-pitch/50 text-cream hover:border-gold/70 hover:bg-gold/10 hover:-translate-y-0.5";

          return (
            <button
              key={opt.value}
              type="button"
              disabled={locked}
              onClick={() => onSelect(opt.value)}
              className={`rounded-xl border-2 px-4 py-3.5 text-center font-bold transition-all duration-200 ${stateClass}`}
            >
              <span className="block font-mono text-sm tracking-wider">{opt.label}</span>
              <span className="block text-xs font-medium opacity-70">{opt.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
