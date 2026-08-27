import Card from "../ui/Card";

/* ============================================================
   RankingPanel — tách từ khối "Bảng Xếp Hạng Tuần" của HomePage gốc.
   ============================================================ */

export default function RankingPanel({ players }) {
  return (
    <Card className="p-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep mb-4 flex items-center gap-2">
        🏆 Bảng Xếp Hạng Tuần
      </h3>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.rank}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
              player.isCurrentUser
                ? "bg-gradient-to-r from-gold-deep/30 to-gold-bright/15 border-gold-deep shadow-[0_0_14px_rgba(218,165,32,0.22)]"
                : "bg-pitch/30 border-gold/15 hover:border-gold/40 hover:-translate-y-0.5"
            }`}
          >
            <div
              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                player.rank <= 3
                  ? "bg-gradient-to-br from-gold-deep to-gold-bright text-pitch"
                  : "bg-cream/15 text-cream"
              }`}
            >
              {player.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${player.isCurrentUser ? "text-gold-bright" : "text-cream"}`}>
                {player.name}
              </p>
              <p className="font-mono text-[11px] text-cream/55">
                ⭐ {player.stars} · 💰 {player.coins.toLocaleString("vi-VN")}
              </p>
            </div>
            {player.isCurrentUser && (
              <span className="shrink-0 font-mono text-[10px] font-bold text-gold-deep border border-gold-deep/50 rounded px-1.5 py-0.5">
                YOU
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gold/15 text-center">
        <button type="button" className="text-xs text-cream/60 hover:text-gold-deep transition-colors">
          Xem xếp hạng đầy đủ →
        </button>
      </div>
    </Card>
  );
}
