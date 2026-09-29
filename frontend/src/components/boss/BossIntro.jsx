import BossCharacter from "./BossCharacter";

export default function BossIntro({ boss, onStart, onLeave, busy, error }) {
  return (
    <main className="boss-intro">
      <div className="boss-intro__field" aria-hidden />
      <div className="boss-intro__copy">
        <p className="boss-intro__eyebrow"><span /> TRẬN CHUNG KẾT HỌC VIỆN</p>
        <p className="boss-intro__overline">BOSS BATTLE <b>#{boss.groupIndex}</b></p>
        <h1>{boss.name}</h1>
        <p className="boss-intro__subtitle">Thử thách kiến thức từ Level {boss.sourceStart}–{boss.sourceEnd}. Mỗi câu trả lời đúng giúp bạn tung một đòn vào Người Gác!</p>
        <div className="boss-intro__rules"><span><strong>10</strong> câu hỏi</span><span><strong>{boss.passThreshold}</strong> câu để vượt qua</span><span>Không giới hạn lần thử</span></div>
        {error && <p className="boss-intro__error" role="alert">{error}</p>}
        <div className="boss-intro__actions">
          <button type="button" className="battle-action battle-action--intro" onClick={onStart} disabled={busy}>{busy ? "ĐANG VÀO SÂN..." : "BẮT ĐẦU TRẬN ĐẤU"}<span aria-hidden>→</span></button>
          <button type="button" className="battle-text-action" onClick={onLeave}>Quay lại hành trình</button>
        </div>
      </div>
      <div className="boss-intro__visual">
        <span className="boss-intro__halo" aria-hidden />
        <span className="boss-intro__circle" aria-hidden />
        <BossCharacter pose="intro" />
        <span className="boss-intro__ground" aria-hidden />
      </div>
    </main>
  );
}
