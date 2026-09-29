import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchJourney } from "../services/bossService";
import BossJourneyNode from "../components/boss/BossJourneyNode";

/* The server orders LEVEL and BOSS nodes and supplies every unlock state. */

/** Icon trang trí theo thứ tự level (backend không lưu icon). */
const LEVEL_ICONS = { 1: "⚽", 2: "🏃", 3: "🏆", 4: "🥇", 5: "🎯" };
const iconFor = (order) => LEVEL_ICONS[order] ?? "📘";

function MiniStar({ filled }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "var(--color-gold-bright)" : "none"}
      stroke={filled ? "var(--color-gold-deep)" : "rgba(244,233,206,0.3)"}
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.4 1.15 6.8L12 17.3l-5.9 3.2 1.15-6.8L2.5 9.3l6.6-1.04L12 2z" />
    </svg>
  );
}

export default function LevelSelectPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tenseId = "" } = useParams();
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!tenseId) return undefined;
    let mounted = true;
    setLoading(true);
    setError("");
    setJourney(null);
    fetchJourney(tenseId)
      .then((res) => mounted && setJourney(res))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [tenseId, retryKey]);

  if (!user) return null;

  const nodes = journey?.nodes ?? [];
  const levels = nodes.filter((node) => node.type === "LEVEL");
  const totalStars = levels.reduce((sum, l) => sum + l.starsEarned, 0);
  const totalPossible = levels.length * 3;
  const tenseName = journey?.tense?.name ?? "";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <PageShell user={user} onLogout={handleLogout} active="levels">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-deep">
              {tenseName || "12 Thì Tiếng Anh"}
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold uppercase tracking-wide text-cream">
              Chọn <span className="text-gold-bright">Level</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {!loading && levels.length > 0 && (
              <p className="font-mono text-sm text-cream/70">
                ⭐ {totalStars}/{totalPossible} sao
              </p>
            )}
            <Link to="/tenses" className="font-mono text-xs text-cream/60 hover:text-gold-bright transition-colors">
              ← Chọn Thì
            </Link>
          </div>
        </div>
      </Reveal>

      {error && (
        <div role="alert" className="anim-rise mb-5 rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-4 text-center text-sm text-[#ff9d92]">
          <p>{error}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setRetryKey((key) => key + 1)}>
            Thử lại
          </Button>
        </div>
      )}

      {loading && (
        <p className="py-16 text-center font-mono text-sm text-cream/50">Đang tải danh sách level...</p>
      )}

      {!loading && !error && nodes.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-4xl" aria-hidden>📭</p>
          <p className="mt-3 text-sm text-cream/65">Chương này chưa có level nào.</p>
          <Button variant="secondary" className="mt-5" onClick={() => navigate("/tenses")}>← Chọn thì khác</Button>
        </Card>
      )}

      {!loading && !error && nodes.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((level, i) => level.type === "BOSS" ? (
          <BossJourneyNode key={level.id} boss={level} />
        ) : (
          <Reveal key={level.id} delay={Math.min(i * 90, 450)}>
            <Card
              shine={level.unlocked}
              className={`relative p-6 flex flex-col h-full border-2 transition-all duration-300 ${
                level.unlocked
                  ? "border-gold-deep/50 hover:border-gold-bright hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
                  : "border-gold/10 opacity-55 grayscale"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl" aria-hidden>{level.unlocked ? iconFor(level.order) : "🔒"}</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-cream/45 border border-gold/20 rounded px-2 py-0.5">
                  LV.{level.order}
                </span>
              </div>

              {/* Tên DẠNG BÀI riêng của từng level (Vấn đề 2) */}
              <h3 className={`font-display mt-4 text-xl font-bold uppercase tracking-wide ${level.unlocked ? "text-cream" : "text-cream/60"}`}>
                {level.name}
              </h3>
              <p className="mt-1 text-[13px] text-cream/60 leading-relaxed">
                {level.unlocked
                  ? `Level ${level.order} · Đã mở khóa, sẵn sàng thi đấu`
                  : `Level ${level.order} · Hoàn thành level trước để mở khóa`}
              </p>

              <div className="mt-4 flex items-center" aria-label={`${level.starsEarned}/3 sao`}>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((s) => (
                    <MiniStar key={s} filled={s < level.starsEarned} />
                  ))}
                </div>
                <span className="ml-auto font-mono text-[11px] text-cream/45">{level.starsEarned}/3</span>
              </div>

              <div className="mt-5 pt-4 border-t border-gold/15">
                {level.unlocked ? (
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/play/${level.id}`, { state: { tenseId } })}
                  >
                    {level.starsEarned > 0 ? "Chơi lại ⚽" : "Bắt đầu ⚽"}
                  </Button>
                ) : (
                  <p className="text-center text-xs text-cream/45 py-2.5">
                    Hoàn thành level trước để mở khóa
                  </p>
                )}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>}
    </PageShell>
  );
}
