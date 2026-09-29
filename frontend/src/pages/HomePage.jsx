import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { displayName } from "../components/layout/PageShell";
import LeaderboardWidget from "../components/home/LeaderboardWidget";
import LearningProgress from "../components/home/LearningProgress";
import StudyModeCard from "../components/home/StudyModeCard";
import UpcomingFeatures from "../components/home/UpcomingFeatures";
import { useAuth } from "../hooks/useAuth";
import { fetchLeaderboard } from "../services/leaderboardService";
import { fetchAllLevels, fetchAllTenses } from "../services/levelService";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [tenses, setTenses] = useState([]);
  const [players, setPlayers] = useState([]);
  const [levelLoading, setLevelLoading] = useState(true);
  const [tenseLoading, setTenseLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [levelError, setLevelError] = useState(false);
  const [tenseError, setTenseError] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLevelLoading(true);
    setTenseLoading(true);
    setLeaderboardLoading(true);
    setLevelError(false);
    setTenseError(false);
    setLeaderboardError("");

    fetchAllLevels()
      .then((data) => { if (active) setLevels(data.levels); })
      .catch(() => { if (active) setLevelError(true); })
      .finally(() => { if (active) setLevelLoading(false); });

    fetchAllTenses()
      .then((data) => { if (active) setTenses(data.tenses); })
      .catch(() => { if (active) setTenseError(true); })
      .finally(() => { if (active) setTenseLoading(false); });

    fetchLeaderboard()
      .then((data) => { if (active) setPlayers(data.players); })
      .catch(() => { if (active) setLeaderboardError("Chưa tải được bảng xếp hạng. Hãy thử lại sau nhé."); })
      .finally(() => { if (active) setLeaderboardLoading(false); });

    return () => { active = false; };
  }, [retryKey]);

  if (!user) return null;

  return (
    <div className="home-lobby mx-auto max-w-[1260px] space-y-7 sm:space-y-9">
      <div className="flex items-end justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gold-deep">Chào mừng trở lại sân học viện</p>
          <p className="mt-1 break-words font-display text-xl font-extrabold text-cream sm:text-2xl">Xin chào, {displayName(user)}!</p>
        </div>
        <span className="hidden text-sm text-cream/55 md:inline">Hôm nay mình học thêm một chút nhé.</span>
      </div>

      <StudyModeCard
        onStart={() => navigate("/tenses")}
        tenses={tenses}
        loading={tenseLoading}
        error={tenseError}
        earnedStars={levelLoading || levelError ? null : levels.reduce((total, level) => total + (Number(level.starsEarned) || 0), 0)}
      />

      <LearningProgress levels={levels} tenseCount={tenseLoading || tenseError ? null : tenses.length} loading={levelLoading} error={levelError} onRetry={() => setRetryKey((key) => key + 1)} />

      <LeaderboardWidget players={players} loading={leaderboardLoading} error={leaderboardError} onRetry={() => setRetryKey((key) => key + 1)} />

      <UpcomingFeatures />
    </div>
  );
}
