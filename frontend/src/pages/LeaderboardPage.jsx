import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import RankingPanel from "../components/home/RankingPanel";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchLeaderboard } from "../services/leaderboardService";

export default function LeaderboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
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
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout, navigate, retryKey]);

  if (!user) return null;

  return (
    <div className="relative min-w-0 py-4 sm:py-8">
      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-cream mb-1">🏆 Bảng Xếp Hạng Tổng</h1>
          <p className="text-cream/50 text-sm">Xếp theo số dư Đô la Đạt hiện tại</p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-3 text-center text-sm text-[#ff9d92]">
            <p>{error}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => setRetryKey((key) => key + 1)}>
              Thử lại
            </Button>
          </div>
        )}

        {loading && !error && (
          <p className="text-center font-mono text-sm text-cream/50">Đang tải bảng xếp hạng...</p>
        )}

        {!loading && !error && players.length === 0 && (
          <p className="text-center text-cream/50 text-sm">Chưa có dữ liệu xếp hạng.</p>
        )}

        {!loading && !error && players.length > 0 && <RankingPanel players={players} />}

        <div className="text-center">
          <Link to="/home" className="text-xs text-cream/60 hover:text-gold-deep transition-colors font-semibold uppercase tracking-wider">
            ← Quay lại Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
