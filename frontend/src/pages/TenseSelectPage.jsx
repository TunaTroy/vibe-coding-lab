import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchAllTenses } from "../services/levelService";

/* ============================================================
   TenseSelectPage — tầng điều hướng "Chọn Thì" (Vấn đề 1 [14]).
   GET /api/tenses → card cho mỗi Thì CÓ trong DB (mở khoá, bấm
   vào → /tenses/:tenseId/levels). Các Thì còn lại trong lộ trình
   "12 Thì" CHƯA có data thật → hiển thị ô "Sắp ra mắt" (khoá),
   KHÔNG bịa seed data.
   ============================================================ */

const TOTAL_TENSE_SLOTS = 12; // lộ trình "12 Thì trong Tiếng Anh"

export default function TenseSelectPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tenses, setTenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchAllTenses()
      .then((res) => mounted && setTenses(res.tenses))
      .catch((err) => mounted && setError(getErrorMessage(err)));
    return () => {
      mounted = false;
    };
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Số ô "Sắp ra mắt" = 12 − số Thì đã có thật trong DB (không âm)
  const lockedCount = Math.max(0, TOTAL_TENSE_SLOTS - tenses.length);

  return (
    <PageShell user={user} onLogout={handleLogout} active="levels">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-deep">
              Chương 1 · 12 Thì Trong Tiếng Anh
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold uppercase tracking-wide text-cream">
              Chọn <span className="text-gold-bright">Thì</span>
            </h2>
          </div>
          <Link to="/home" className="font-mono text-xs text-cream/60 hover:text-gold-bright transition-colors">
            ← Về trang chủ
          </Link>
        </div>
      </Reveal>

      {error && (
        <div role="alert" className="anim-rise mb-5 rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-3 text-sm text-[#ff9d92]">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Thì đã có trong DB — mở khoá */}
        {tenses.map((tense, i) => (
          <Reveal key={tense.id} delay={i * 80}>
            <Card
              shine
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/tenses/${tense.id}/levels`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/tenses/${tense.id}/levels`);
                }
              }}
              className="relative p-6 border-2 border-gold-deep/50 cursor-pointer transition-all duration-300 hover:border-gold-bright hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-bright"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl" aria-hidden>⚽</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-cream/45 border border-gold/20 rounded px-2 py-0.5">
                  Thì {tense.order}
                </span>
              </div>
              <h3 className="font-display mt-4 text-xl font-bold uppercase tracking-wide text-cream">
                {tense.name}
              </h3>
              <p className="mt-1 text-[13px] text-cream/60 leading-relaxed">
                Đã mở khoá · Sẵn sàng thi đấu
              </p>
              <div className="mt-5 pt-4 border-t border-gold/15 flex items-center justify-between">
                <span className="text-xs font-semibold text-gold-bright">Vào học ngay</span>
                <span className="text-gold-bright text-lg transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </Card>
          </Reveal>
        ))}

        {/* Thì chưa có data — khoá "Sắp ra mắt" (không bịa data) */}
        {Array.from({ length: lockedCount }).map((_, i) => (
          <Reveal key={`locked-${i}`} delay={(tenses.length + i) * 60}>
            <Card className="relative p-6 border-2 border-gold/10 opacity-60 cursor-not-allowed">
              <div className="flex items-start justify-between">
                <span className="text-4xl grayscale" aria-hidden>🔒</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-cream/35 border border-gold/10 rounded px-2 py-0.5">
                  Thì {tenses.length + i + 1}
                </span>
              </div>
              <h3 className="font-display mt-4 text-xl font-bold uppercase tracking-wide text-cream/50">
                Sắp ra mắt
              </h3>
              <p className="mt-1 text-[13px] text-cream/40 leading-relaxed">
                Đang được huấn luyện viên soạn giáo án…
              </p>
              <div className="mt-5 pt-4 border-t border-gold/10">
                <span className="text-xs font-semibold text-cream/35">Coming Soon</span>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
