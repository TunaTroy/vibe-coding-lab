/* ============================================================
   MULTIPLE_CHOICE — tách nguyên vẹn từ QuestionRenderer.jsx.
   payload contract: { options: string[] }
   answer gửi lên: number — index trong payload.options
   ============================================================ */

const LETTERS = ["A", "B", "C", "D", "E"];

export default function MultipleChoiceQuestion({ question, selected, locked, onSelect }) {
  const options = question.payload?.options ?? [];

  return (
    <div className="anim-rise">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-cream leading-snug">
        {question.prompt}
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const isSelected = i === selected;
          const stateClass = isSelected
            ? "border-gold-bright bg-gold/20 text-gold-bright shadow-[0_0_18px_rgba(255,215,0,0.2)]"
            : "border-gold/25 bg-pitch/50 text-cream hover:border-gold/70 hover:bg-gold/10 hover:-translate-y-0.5";

          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => onSelect(i)}
              className={`group flex items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 text-left font-semibold transition-all duration-200 ${stateClass}`}
            >
              <span
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-mono text-sm font-bold transition-colors
                  ${isSelected ? "bg-gold-bright text-pitch" : "bg-gold/15 text-gold group-hover:bg-gold/30"}`}
              >
                {LETTERS[i]}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
