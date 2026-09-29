import BossCharacter from "./BossCharacter";
import BattleFeedback from "./BattleFeedback";
import BattleHUD from "./BattleHUD";
import BattleQuestion from "./BattleQuestion";

export default function BossArena({ boss, attempt, question, selected, onSelect, onConfirm, feedback, feedbackReady, onContinue, submitting, error, hp, pose, effect, combo }) {
  return (
    <main className="battle-arena">
      <div className={`battle-stage ${effect === "attack" ? "battle-stage--counter" : ""}`}>
        <div className="battle-stage__stands" aria-hidden />
        <div className="battle-stage__lamp battle-stage__lamp--left" aria-hidden />
        <div className="battle-stage__lamp battle-stage__lamp--right" aria-hidden />
        <div className="battle-stage__beam battle-stage__beam--left" aria-hidden />
        <div className="battle-stage__beam battle-stage__beam--right" aria-hidden />
        <div className="battle-stage__pitch" aria-hidden><span className="battle-stage__center-circle" /></div>
        <BattleHUD name={boss.name} hp={hp} questionNumber={question.position} totalQuestions={attempt.totalQuestions} combo={combo} lowHp={hp <= 30} />
        <div className="battle-stage__platform" aria-hidden />
        <div className="battle-stage__guardian"><BossCharacter pose={pose} /></div>
        <div className="battle-stage__shield" aria-label="Khiên học viện bảo vệ người học"><svg viewBox="0 0 72 78" fill="none" aria-hidden><path d="M36 3 66 14v24c0 19-12 31-30 37C18 69 6 57 6 38V14Z" fill="#a51b2b" stroke="#f4c94d" strokeWidth="5" /><path d="M36 12 57 20v19c0 12-8 22-21 27-13-5-21-15-21-27V20Z" fill="#192e2b" /><path d="M23 30q7-3 13 2 6-5 13-2v21q-7-3-13 2-6-5-13-2Z" fill="#f9dc8a" /><path d="M36 32v21" stroke="#a51b2b" strokeWidth="3" /></svg><span>HỌC VIỆN</span></div>
        <BattleFeedback mode={effect} feedback={feedback} />
      </div>
      <BattleQuestion question={question} selected={selected} onSelect={onSelect} onConfirm={onConfirm} feedback={feedback} feedbackReady={feedbackReady} onContinue={onContinue} submitting={submitting} error={error} />
    </main>
  );
}
