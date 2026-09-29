import BossCharacter from "./BossCharacter";

function ResultStar({ filled, index }) {
  return <svg className={`boss-result__star ${filled ? "boss-result__star--filled" : ""}`} style={{ "--star-delay": `${index * 130}ms` }} viewBox="0 0 72 72" fill="none" aria-hidden><path d="m36 4 9.5 19.5L67 27l-15.5 15 3.7 21.4L36 53.2 16.8 63.4 20.5 42 5 27l21.5-3.5Z" fill={filled ? "url(#result-star-gold)" : "#3f3a34"} stroke={filled ? "#fff3b1" : "#7b6d57"} strokeWidth="3" /><defs><linearGradient id="result-star-gold" x1="13" y1="7" x2="58" y2="66"><stop stopColor="#fff5bd" /><stop offset=".5" stopColor="#f2bd3b" /><stop offset="1" stopColor="#bc791f" /></linearGradient></defs></svg>;
}

export default function BossResult({ boss, result, reviewNotes = [], onJourney, onReplay, busy, error }) {
  const victory = result.passed;
  return (
    <main className={`boss-result ${victory ? "boss-result--victory" : "boss-result--retry"}`}>
      <p className="sr-only" role="status" aria-live="polite">{victory ? "Chiến thắng!" : "Suýt nữa thôi!"} Bạn trả lời đúng {result.score} trên 10 câu.</p>
      <div className="boss-result__rays" aria-hidden />
      <div className="boss-result__art"><BossCharacter pose={victory ? "defeated" : "low_hp"} /></div>
      <div className="boss-result__copy">
        <span className="boss-result__seal" aria-hidden><svg viewBox="0 0 64 64" fill="none"><path d="M16 7h32v21c0 11-7 18-16 18S16 39 16 28V7Z" stroke="currentColor" strokeWidth="4" /><path d="M16 13H7v12c0 7 5 12 12 12m29-24h9v12c0 7-5 12-12 12M32 46v10m-13 2h26" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></span>
        <p className="boss-result__eyebrow">{victory ? "TRẬN ĐẤU HOÀN TẤT" : "BẠN ĐÃ RẤT GẦN RỒI"}</p>
        <h1>{victory ? "CHIẾN THẮNG!" : "SUÝT NỮA THÔI!"}</h1>
        <p className="boss-result__name">{victory ? `${boss.name} đã nhường đường cho bạn.` : `${boss.name} vẫn đang chờ lần tái đấu.`}</p>
        {victory && <div className="boss-result__stars" aria-label={`${result.stars} trên 3 sao`}>{[0, 1, 2].map(i => <ResultStar key={i} index={i} filled={i < result.stars} />)}</div>}
        <div className="boss-result__score"><strong>{result.score}<span>/10</span></strong><span>câu chính xác</span></div>
        <p className="boss-result__message">{victory ? "Bạn đã vượt qua thử thách của chặng học này!" : "Ôn lại các Level vừa học rồi thử lại nhé. Bạn có thể chiến thắng!"}</p>
        {!victory && reviewNotes.length > 0 && <div className="boss-result__review"><h2>Ghi nhớ cho lần sau</h2><ul>{reviewNotes.slice(0, 3).map(note => <li key={note.position}><strong>Câu {note.position}:</strong> {note.explanation}</li>)}</ul></div>}
        {error && <p className="boss-result__error" role="alert">{error}</p>}
        <div className="boss-result__actions">
          <button type="button" className="battle-action" onClick={victory ? onJourney : onReplay} disabled={busy}>{victory ? "TIẾP TỤC HÀNH TRÌNH" : busy ? "ĐANG CHUẨN BỊ..." : "THỬ LẠI"}<span aria-hidden>→</span></button>
          <button type="button" className="battle-text-action" onClick={victory ? onReplay : onJourney} disabled={busy}>{victory ? "Đánh lại" : "Ôn lại Level"}</button>
        </div>
      </div>
    </main>
  );
}
