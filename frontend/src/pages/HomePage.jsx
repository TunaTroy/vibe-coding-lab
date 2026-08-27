import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BattleModeCard from "../components/home/BattleModeCard";
import RankingPanel from "../components/home/RankingPanel";
import StudyModeCard from "../components/home/StudyModeCard";
import PageShell, { displayName } from "../components/layout/PageShell";
import SideMenu from "../components/layout/SideMenu";
import Reveal from "../components/ui/Reveal";
import { DAILY_TASKS_SEED, RANKING_SEED } from "../data/levels";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchAllLevels } from "../services/levelService";

/* ============================================================
   HomePage — SAU REFACTOR chỉ còn làm nhiệm vụ compose:
   PageShell + SideMenu + StudyMode + BattleMode + Ranking.
   (Bản gốc: 1 file ~21KB chứa mọi thứ.)
   ============================================================ */

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState("");

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

  // Bảng xếp hạng: seed + người chơi hiện tại, sort theo sao
  const players = [
    ...RANKING_SEED.map((p) => ({ ...p, rank: 0, isCurrentUser: false })),
    { rank: 0, name: displayName(user), stars: 12, coins: user.coinBalance, isCurrentUser: true },
  ]
    .sort((a, b) => b.stars - a.stars)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <PageShell user={user} onLogout={handleLogout} active="home">
      {/* Lời chào */}
      <Reveal>
        <div className="mb-6">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-cream">
            Chào mừng trở lại, <span className="text-gold-bright">{displayName(user)}</span>! 👋
          </h2>
          <p className="mt-1.5 text-sm text-cream/60">
            Sân Old Trafford đang chờ bạn — hoàn thành bài học hôm nay để leo hạng nào.
          </p>
        </div>
      </Reveal>

      {error && (
        <div role="alert" className="anim-rise mb-5 rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-3 text-sm text-[#ff9d92]">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Cột trái: menu + nhiệm vụ */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Reveal delay={80}>
            <SideMenu tasks={DAILY_TASKS_SEED} />
          </Reveal>
        </div>

        {/* Cột giữa: 2 chế độ */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
          <Reveal delay={40}>
            <StudyModeCard levelsCount={levels.length} onStart={() => navigate("/levels")} />
          </Reveal>
          <Reveal delay={140}>
            <BattleModeCard />
          </Reveal>
        </div>

        {/* Cột phải: xếp hạng */}
        <div className="lg:col-span-3 order-3">
          <Reveal delay={120}>
            <RankingPanel players={players} />
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
