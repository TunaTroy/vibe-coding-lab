import { Link } from "react-router-dom";

function CoinIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.5" /><path d="M12 8v8m-2-6h3a2 2 0 0 1 0 4h-3" /></svg>;
}

export default function LeaderboardWidget({ players, loading = false, error = "", onRetry }) {
  const leaders = players.slice(0, 3);
  const current = players.find((player) => player.isCurrentUser);
  const showCurrent = current && !leaders.some((player) => player.rank === current.rank);

  return (
    <section className="league-panel rounded-3xl border border-gold/20 px-5 py-6 sm:px-7" aria-labelledby="league-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gold-deep">Theo số dư Đô la Đạt</p>
          <h2 id="league-title" className="mt-1 font-display text-2xl font-extrabold text-cream">Bảng xếp hạng tổng</h2>
        </div>
        <Link to="/leaderboard" className="inline-flex min-h-11 items-center text-sm font-bold text-gold-bright underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-bright">Xem bảng xếp hạng →</Link>
      </div>

      {loading && <p className="py-8 text-sm text-cream/60">Đang tải bảng xếp hạng...</p>}
      {!loading && error && <div role="alert" className="flex flex-wrap items-center gap-3 py-7 text-sm text-cream/65"><span>{error}</span><button type="button" onClick={onRetry} className="min-h-11 font-bold text-gold-bright underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-bright">Thử lại</button></div>}
      {!loading && !error && players.length === 0 && <p className="py-8 text-sm text-cream/65">Chưa có thành tích để xếp hạng.</p>}
      {!loading && !error && players.length > 0 && <div className="mt-5 space-y-2">
        {leaders.map((player) => <div key={player.rank} className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 sm:px-4 ${player.isCurrentUser ? "border-gold/60 bg-gold/10" : "border-gold/10 bg-black/15"}`}>
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-black ${player.rank === 1 ? "border-gold-bright bg-gold-bright text-night" : "border-gold/30 bg-gold/10 text-gold-bright"}`}>{player.rank}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cream">{player.name}{player.isCurrentUser && <span className="ml-2 text-xs font-medium text-gold-bright">Bạn</span>}</span>
          <span className="hidden whitespace-nowrap text-sm text-cream/60 sm:inline">{player.stars} ★</span>
          <span className="flex max-w-[42%] items-center gap-1 truncate text-sm font-bold text-gold-bright" aria-label={`${player.coins} Đô la Đạt`}><CoinIcon /><span className="truncate">{player.coins.toLocaleString("vi-VN")}</span></span>
        </div>)}
        {showCurrent && <div className="flex min-h-12 items-center gap-3 border-t border-gold/20 px-3 pt-3 text-sm">
          <span className="w-9 shrink-0 text-center font-bold text-gold-bright">#{current.rank}</span>
          <span className="min-w-0 flex-1 truncate font-semibold text-cream">Bạn · {current.name}</span>
          <span className="hidden text-cream/60 sm:inline">{current.stars} ★</span>
          <span className="flex max-w-[42%] items-center gap-1 truncate font-bold text-gold-bright" aria-label={`${current.coins} Đô la Đạt`}><CoinIcon /><span className="truncate">{current.coins.toLocaleString("vi-VN")}</span></span>
        </div>}
      </div>}
    </section>
  );
}
