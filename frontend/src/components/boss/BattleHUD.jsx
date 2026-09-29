export default function BattleHUD({ name, hp, questionNumber, totalQuestions, combo = 0, lowHp = false }) {
  return (
    <div className="battle-hud">
      <div className="battle-hud__boss">
        <div className="battle-hud__label"><span className="battle-hud__boss-mark" aria-hidden>◆</span><span>{name}</span><span className="battle-hud__hp-number">{hp} / 100 HP</span></div>
        <div className={`battle-hud__track ${lowHp ? "battle-hud__track--low" : ""}`} role="progressbar" aria-label="Máu của Boss" aria-valuenow={hp} aria-valuemin="0" aria-valuemax="100">
          <div className="battle-hud__fill" style={{ width: `${hp}%` }} />
          <div className="battle-hud__shine" aria-hidden />
        </div>
      </div>
      <div className="battle-hud__aside">
        <span>CÂU <strong>{questionNumber}</strong> / {totalQuestions}</span>
        {combo >= 2 && <span className="battle-hud__combo" aria-label={`Chuỗi ${combo} câu đúng liên tiếp trong trận này`}>PHONG ĐỘ ×{combo}</span>}
      </div>
    </div>
  );
}
