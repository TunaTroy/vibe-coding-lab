import { Link } from "react-router-dom";
import BossCharacter from "./BossCharacter";
import "./boss.css";

function Star({ filled }) {
  return <svg viewBox="0 0 24 24" className={`h-5 w-5 ${filled ? "text-gold-bright" : "text-cream/25"}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="m12 2 3.1 6.4 7 1-5.1 5 .9 7.1L12 18.2l-5.9 3.3.9-7.1-5.1-5 7-1Z" /></svg>;
}

export default function BossJourneyNode({ boss }) {
  const state = boss.passed ? "passed" : boss.unlocked ? "unlocked" : "locked";
  return (
    <section className={`boss-journey boss-journey--${state} sm:col-span-2 lg:col-span-3`} aria-label={`Boss ${boss.name}`}>
      <div className="boss-journey__stadium" aria-hidden />
      <div className="boss-journey__spotlight" aria-hidden />
      <div className="boss-journey__art">
        <BossCharacter pose={boss.passed ? "defeated" : boss.unlocked ? "idle" : "intro"} />
      </div>
      <div className="boss-journey__content">
        <div className="boss-journey__eyebrow"><span className="boss-journey__diamond" /> TRẬN KIỂM TRA · CHẶNG {boss.groupIndex}</div>
        <p className="boss-journey__kicker">BOSS BATTLE</p>
        <h3>{boss.name}</h3>
        <p className="boss-journey__range">Thử thách kiến thức Level {boss.sourceStart}–{boss.sourceEnd}</p>
        {boss.passed ? (
          <div className="boss-journey__result">
            <span className="boss-journey__passed">✓ Đã vượt qua</span>
            <span className="boss-journey__stars" aria-label={`${boss.bestStars} trên 3 sao tốt nhất`}>
              {[0, 1, 2].map((i) => <Star key={i} filled={i < boss.bestStars} />)}
            </span>
            <span className="boss-journey__score">Tốt nhất: {boss.bestScore}/10</span>
          </div>
        ) : boss.unlocked ? (
          <p className="boss-journey__status">Sân đấu đã mở. Bạn sẵn sàng chưa?</p>
        ) : (
          <p className="boss-journey__status boss-journey__status--locked">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            Hoàn thành Level {boss.sourceStart}–{boss.sourceEnd} để mở
          </p>
        )}
        {boss.unlocked && (
          <Link className="boss-journey__cta" to={`/bosses/${boss.id}`}>
            {boss.passed ? "ĐÁNH LẠI" : "VÀO TRẬN BOSS"}
            <span aria-hidden>↗</span>
          </Link>
        )}
      </div>
      <span className="boss-journey__badge" aria-hidden>{boss.passed ? "✓" : boss.unlocked ? "◆" : "◇"}</span>
    </section>
  );
}
