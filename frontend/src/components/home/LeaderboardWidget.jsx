import { useNavigate } from "react-router-dom";

import Card from "../ui/Card";

/* ============================================================
   LeaderboardWidget — Widget bảng xếp hạng tuần theo UI Spec:
   - Top 5 người chơi với avatar/initials
   - Highlight dòng user hiện tại (đóng khung riêng)
   - Link "Xem toàn bộ BXH" điều hướng sang /leaderboard
   ============================================================ */

export default function LeaderboardWidget({ players }) {
  const navigate = useNavigate();

  return (
    <Card className="p-5 border-2 border-gold/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden>🏆</span>
        <h3 className="font-display text-base font-bold text-cream uppercase tracking-wider">
          Bảng Xếp Hạng Tuần
        </h3>
      </div>

      {/* Danh sách xếp hạng */}
      <div className="space-y-2">
        {players.slice(0, 5).map((player, index) => {
          const isCurrentUser = player.isCurrentUser;
          const rank = player.rank || index + 1;

          // Avatar initial
          const initial = player.name.charAt(0).toUpperCase();

          // Style cho top 3
          const isTopThree = rank <= 3;

          return (
            <div
              key={player.name || rank}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                isCurrentUser
                  ? "bg-gradient-to-r from-gold-deep/30 to-gold-bright/15 border-gold-deep shadow-[0_0_14px_rgba(218,165,32,0.22)]"
                  : "bg-pitch/30 border-gold/15 hover:border-gold/40 hover:-translate-y-0.5"
              }`}
            >
              {/* Rank badge */}
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                  isTopThree
                    ? "bg-gradient-to-br from-gold-deep to-gold-bright text-pitch"
                    : "bg-cream/15 text-cream"
                }`}
              >
                {rank}
              </div>

              {/* Avatar initial */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base ${
                  isTopThree
                    ? "bg-gradient-to-br from-crimson to-ember text-cream"
                    : "bg-cream/10 text-cream/70"
                }`}
              >
                {initial}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${isCurrentUser ? "text-gold-bright" : "text-cream"}`}>
                  {player.name}
                </p>
              </div>

              {/* Score (căn phải) */}
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-lg" role="img" aria-label="coin">🪙</span>
                <span className="font-mono text-sm font-bold text-gold-bright">
                  {player.coins.toLocaleString("vi-VN")}
                </span>
              </div>

              {/* YOU badge cho user hiện tại */}
              {isCurrentUser && (
                <span className="shrink-0 font-mono text-[10px] font-bold text-gold-deep border border-gold-deep/50 rounded px-1.5 py-0.5">
                  YOU
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-4 border-t border-gold/15 text-center">
        <button
          type="button"
          onClick={() => navigate("/leaderboard")}
          className="text-xs text-cream/60 hover:text-gold-deep transition-colors font-semibold uppercase tracking-wider"
        >
          Xem toàn bộ BXH →
        </button>
      </div>
    </Card>
  );
}
