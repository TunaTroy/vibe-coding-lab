import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BattleModeCard from "../components/home/BattleModeCard";
import EventBanner from "../components/home/EventBanner";
import LeaderboardWidget from "../components/home/LeaderboardWidget";
import StudyModeCard from "../components/home/StudyModeCard";
import SidebarNav from "../components/layout/SidebarNav";
import TopBar from "../components/layout/TopBar";
import Reveal from "../components/ui/Reveal";
import { DAILY_TASKS_SEED } from "../data/levels";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchLeaderboard } from "../services/leaderboardService";
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
  const [players, setPlayers] = useState([]);
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
    // Bảng xếp hạng: dữ liệu thật từ DB (coinBalance + tổng stars), backend
    // tự tính rank + đánh dấu isCurrentUser. Lỗi ở đây không đăng xuất user,
    // chỉ để widget rỗng (không phải thao tác bắt buộc như danh sách level).
    fetchLeaderboard()
      .then((res) => {
        if (mounted) setPlayers(res.players);
      })
      .catch(() => {
        /* widget tự ẩn nếu players rỗng, không cần báo lỗi riêng ở đây */
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

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
      <SidebarNav
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* TopBar */}
        <TopBar onMenuToggle={() => setIsMenuOpen(true)} />

        {/* Main Content Container */}
        <div className="bg-gradient-to-b from-[#241f1f]/80 to-[#141010]/80 border-x border-b border-gold/20 rounded-b-2xl p-6 space-y-6">
          {error && (
            <div
              role="alert"
              className="anim-rise rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-3 text-sm text-[#ff9d92]"
            >
              {error}
            </div>
          )}

          {/* Hàng 1: Grid 2 cột - Study Mode & Battle Mode */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cột trái: Chế độ Học */}
            <Reveal delay={40}>
              <StudyModeCard
                levelsCount={levels.length}
                onStart={() => navigate("/tenses")}
              />
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
