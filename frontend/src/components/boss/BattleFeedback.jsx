export default function BattleFeedback({ mode, feedback }) {
  if (!mode) return null;
  const correct = mode === "hit" || mode === "final";
  return (
    <div className={`battle-effects battle-effects--${mode}`} aria-hidden>
      <span className="battle-effects__projectile" />
      <span className="battle-effects__impact" />
      <span className="battle-effects__spark battle-effects__spark--one" />
      <span className="battle-effects__spark battle-effects__spark--two" />
      <span className="battle-effects__spark battle-effects__spark--three" />
      {mode === "hit" && feedback?.isCorrect && <span className="battle-effects__damage">−10</span>}
      {mode === "final" && <span className="battle-effects__final">ĐÒN QUYẾT ĐỊNH!</span>}
      {!correct && <span className="battle-effects__shield-ring" />}
    </div>
  );
}
