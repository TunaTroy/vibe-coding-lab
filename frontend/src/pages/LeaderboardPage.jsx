import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import RankingPanel from "../components/home/RankingPanel";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchLeaderboard } from "../services/leaderboardService";

export default function LeaderboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchLeaderboard()
      .then((res) => {
        if (mounted) setPlayers(res.players);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(getErrorMessage(err));
        if (err?.status === 401) {
          void logout();
          navigate("/login");
        }
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8">
      <div className="relative z-10 max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-cream mb-1">🏆 Bảng Xếp Hạng</h1>
          <p className="text-cream/50 text-sm">Xếp theo tổng Coin đã kiếm được</p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-3 text-sm text-[#ff9d92]">
            {error}
          </div>
        )}

        {!error && players.length === 0 && (
          <p className="text-center text-cream/50 text-sm">Chưa có dữ liệu xếp hạng.</p>
        )}

        {players.length > 0 && <RankingPanel players={players} />}

        <div className="text-center">
          <Link to="/home" className="text-xs text-cream/60 hover:text-gold-deep transition-colors font-semibold uppercase tracking-wider">
            ← Quay lại Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
