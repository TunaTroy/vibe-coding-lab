import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BattleModeCard from "../components/home/BattleModeCard";
import EventBanner from "../components/home/EventBanner";
import LeaderboardWidget from "../components/home/LeaderboardWidget";
import StudyModeCard from "../components/home/StudyModeCard";
import SidebarNav from "../components/layout/SidebarNav";
import TopBar from "../components/layout/TopBar";
import Reveal from "../components/ui/Reveal";
import { DAILY_TASKS_SEED, RANKING_SEED } from "../data/levels";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchAllLevels } from "../services/levelService";

/* ============================================================
   HomePage — SAU REFACTOR theo UI Spec mới:
   Layout: TopBar → Grid 2 cột (Study + Battle) → Leaderboard → EventBanner
   SidebarNav dạng drawer off-canvas thay thế SideMenu cũ
   ============================================================ */

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchAllLevels()
      .then((res) => {
        if (mounted) setLevels(res.levels);
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

  // Bảng xếp hạng: seed + người chơi hiện tại, sort theo coins
  const players = [
    ...RANKING_SEED.map((p) => ({ ...p, rank: 0, isCurrentUser: false })),
    { rank: 0, name: user.email.split("@")[0], stars: 12, coins: user.coinBalance, isCurrentUser: true },
  ]
    .sort((a, b) => b.coins - a.coins)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background arena */}
      <div className="arena-bg" aria-hidden />
      <div className="arena-glow" aria-hidden />
      <div className="arena-noise" aria-hidden />

      {/* Sidebar Drawer */}
      <SidebarNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onLogout={handleLogout} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* TopBar */}
        <TopBar onMenuToggle={() => setIsMenuOpen(true)} />

        {/* Main Content Container */}
        <div className="bg-gradient-to-b from-[#241f1f]/80 to-[#141010]/80 border-x border-b border-gold/20 rounded-b-2xl p-6 space-y-6">
          {error && (
            <div role="alert" className="anim-rise rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-3 text-sm text-[#ff9d92]">
              {error}
            </div>
          )}

          {/* Hàng 1: Grid 2 cột - Study Mode & Battle Mode */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cột trái: Chế độ Học */}
            <Reveal delay={40}>
              <StudyModeCard levelsCount={levels.length} onStart={() => navigate("/levels")} />
            </Reveal>

            {/* Cột phải: Chế độ Chiến */}
            <Reveal delay={140}>
              <BattleModeCard />
            </Reveal>
          </div>

          {/* Hàng 2: Bảng Xếp Hạng */}
          <Reveal delay={120}>
            <LeaderboardWidget players={players} />
          </Reveal>

          {/* Hàng 3: Event Banner Footer */}
          <Reveal delay={160}>
            <EventBanner />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
