import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import QuestionRenderer from "../components/quiz/QuestionRenderer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchLevelQuestions, submitLevel } from "../services/levelService";

/* ============================================================
   BossBattlePage — Level "trùm cuối" (isBoss=true) [15].
   Bài kiểm tra tổng hợp, UI đối kháng Người chơi vs Boss.

   LUỒNG:
   1. GET /api/levels/:id/questions → { level, questions }.
      Nếu level KHÔNG phải boss → redirect về /play/:id (UI thường).
   2. Trả lời TUẦN TỰ từng câu (tái dụng QuestionRenderer nguyên trạng).
      Mỗi lần chọn: người chơi tung đòn (hiệu ứng), KHÔNG tiết lộ đúng/sai.
   3. Hết câu → POST /submit (giữ nguyên payload) → nhận correctAnswers THẬT.
   4. "resolution": diễn lại trận đấu — đúng → Boss trừ máu, sai → Người chơi
      trừ máu (tính từ correctAnswers của server, chống gian lận).
   5. "done": báo cáo chi tiết từng câu + hint, nút Chơi lại / Về Chọn Thì.

   QUAN TRỌNG: correctAnswer bị backend strip khỏi GET questions (bất biến
   chống gian lận). Do đó đúng/sai CHỈ biết sau khi nộp bài — hiệu ứng máu
   được diễn ở bước 4 dựa trên dữ liệu server trả về, KHÔNG lộ đáp án trước.
   ============================================================ */

const PLAYER_EMOJI = "🦸";
const BOSS_EMOJI = "🐉";
const BOSS_NAME = "Trùm Ngữ Pháp";

function HpBar({ label, hp, emoji, tone, hit, alignRight }) {
  const fill =
    tone === "player"
      ? "bg-gradient-to-r from-gold-deep to-gold-bright"
      : "bg-gradient-to-r from-crimson to-ember";
  return (
    <div className={`flex-1 ${alignRight ? "text-right" : ""}`}>
      <div className={`flex items-center gap-2 mb-1.5 ${alignRight ? "flex-row-reverse" : ""}`}>
        <span className={`text-2xl ${hit ? "anim-hit inline-block" : ""}`} aria-hidden>{emoji}</span>
        <span className="font-display font-bold text-sm uppercase tracking-wider text-cream">{label}</span>
        <span className="font-mono text-xs text-cream/60">{Math.max(0, Math.round(hp))}/100</span>
      </div>
      <div className="h-4 rounded-full bg-pitch/70 border border-gold/20 overflow-hidden">
        <div
          className={`h-full rounded-full ${fill} transition-all duration-500 ease-out ${alignRight ? "ml-auto" : ""}`}
          style={{ width: `${Math.max(0, hp)}%` }}
        />
      </div>
    </div>
  );
}

export default function BossBattlePage() {
  const { levelId = "" } = useParams();
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // answering → attacking → submitting → resolution → done
  const [phase, setPhase] = useState("answering");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [shot, setShot] = useState(null); // "player" | "boss" | null
  const [playerHit, setPlayerHit] = useState(false);
  const [bossHit, setBossHit] = useState(false);
  const [resIndex, setResIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    setData(null);
    setLoadError("");
    fetchLevelQuestions(levelId)
      .then((res) => {
        if (!mounted) return;
        // Không phải boss → trả về UI chơi thường
        if (!res?.level?.isBoss) {
          navigate(`/play/${levelId}`, { replace: true });
          return;
        }
        setData(res);
      })
      .catch((err) => mounted && setLoadError(getErrorMessage(err)));
    return () => {
      mounted = false;
    };
  }, [levelId, navigate]);

  const resetQuiz = useCallback(() => {
    setPhase("answering");
    setIndex(0);
    setAnswers({});
    setResult(null);
    setPlayerHp(100);
    setBossHp(100);
    setShot(null);
    setPlayerHit(false);
    setBossHit(false);
    setResIndex(0);
    setSubmitError("");
  }, []);

  // ---- Diễn lại trận đấu dựa trên correctAnswers thật (sau khi nộp) ----
  const total = data ? data.questions.length : 0;
  const chunk = total > 0 ? 100 / total : 0;

  useEffect(() => {
    if (phase !== "resolution" || !result) return undefined;

    if (resIndex >= total) {
      const t = setTimeout(() => setPhase("done"), 650);
      return () => clearTimeout(t);
    }

    const q = data.questions[resIndex];
    const isCorrect =
      JSON.stringify(answers[q.id]) === JSON.stringify(result.correctAnswers[q.id]);

    setShot(isCorrect ? "player" : "boss");

    const t = setTimeout(() => {
      if (isCorrect) {
        setBossHp((hp) => Math.max(0, hp - chunk));
        setBossHit(true);
        setTimeout(() => setBossHit(false), 420);
      } else {
        setPlayerHp((hp) => Math.max(0, hp - chunk));
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 420);
      }
      setShot(null);
      setResIndex((i) => i + 1);
    }, 300);

    return () => clearTimeout(t);
  }, [phase, resIndex, result, answers, data, total, chunk]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loadError) {
    return (
      <PageShell user={user} onLogout={handleLogout} active="levels">
        <Card className="p-10 text-center max-w-lg mx-auto">
          <p className="text-3xl" aria-hidden>🟥</p>
          <p className="mt-3 text-sm text-cream/70">{loadError}</p>
          <Button variant="secondary" className="mt-5" onClick={() => navigate("/tenses")}>
            ← Về chọn Thì
          </Button>
        </Card>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell user={user} onLogout={handleLogout} active="levels">
        <div className="flex items-center justify-center py-24">
          <p className="font-mono text-sm text-cream/50">
            Đang triệu hồi Trùm<span className="cursor-blink">...</span>
          </p>
        </div>
      </PageShell>
    );
  }

  const level = data.level;
  const questions = data.questions;
  const question = questions[index];
  const selected = answers[question.id] ?? null;

  const doSubmit = async (finalAnswers) => {
    try {
      const res = await submitLevel(
        level.id,
        questions.map((q) => ({ questionId: q.id, answer: finalAnswers[q.id] ?? -1 }))
      );
      setResult(res);
      if (res.coinAwarded > 0) {
        refreshUser({ ...user, coinBalance: user.coinBalance + res.coinAwarded });
      }
      // Diễn lại trận đấu từ đầu với dữ liệu thật
      setPlayerHp(100);
      setBossHp(100);
      setResIndex(0);
      setPhase("resolution");
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setPhase("answering");
    }
  };

  const handleSelect = (answer) => {
    if (phase !== "answering") return;
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);
    setPhase("attacking");
    // Người chơi tung đòn (chưa tiết lộ đúng/sai)
    setShot("player");
    setBossHit(true);

    setTimeout(() => {
      setShot(null);
      setBossHit(false);
      if (index >= total - 1) {
        setPhase("submitting");
        void doSubmit(newAnswers);
      } else {
        setIndex((i) => i + 1);
        setPhase("answering");
      }
    }, 800);
  };

  const correctCount = result
    ? questions.filter(
        (q) => JSON.stringify(answers[q.id]) === JSON.stringify(result.correctAnswers[q.id])
      ).length
    : 0;
  const passed = result ? result.score >= level.passScore : false;

  /* ---------------- Màn báo cáo ---------------- */
  if (phase === "done" && result) {
    return (
      <PageShell user={user} onLogout={handleLogout} active="levels">
        <div className="max-w-3xl mx-auto">
          <Card shine className={`p-8 border-2 ${passed ? "border-gold-bright/60" : "border-crimson/60"}`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold/70 text-center">
              Trận đấu kết thúc
            </p>
            <h2
              className={`font-display mt-2 text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-center ${
                passed ? "text-gold-bright" : "text-[#e0394f]"
              }`}
            >
              {passed ? "🏆 Chiến thắng!" : "💀 Chưa hạ được Trùm"}
            </h2>

            {/* Kết quả máu sau trận */}
            <div className="mt-6 flex items-center gap-4">
              <HpBar label="Bạn" hp={playerHp} emoji={PLAYER_EMOJI} tone="player" hit={false} />
              <HpBar label={BOSS_NAME} hp={bossHp} emoji={BOSS_EMOJI} tone="boss" hit={false} alignRight />
            </div>

            {/* Tổng quan */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl border border-gold/20 bg-pitch/60 px-3 py-3">
                <p className="font-mono text-xl font-bold text-cream">{correctCount}/{total}</p>
                <p className="text-[11px] uppercase tracking-wider text-cream/50">Câu đúng</p>
              </div>
              <div className="rounded-xl border border-gold/20 bg-pitch/60 px-3 py-3">
                <p className="font-mono text-xl font-bold text-gold-bright">{result.score}%</p>
                <p className="text-[11px] uppercase tracking-wider text-cream/50">Cần ≥{level.passScore}%</p>
              </div>
              <div className="rounded-xl border border-gold/20 bg-pitch/60 px-3 py-3">
                <p className="font-mono text-xl font-bold text-gold-bright">{"⭐".repeat(result.stars) || "—"}</p>
                <p className="text-[11px] uppercase tracking-wider text-cream/50">Sao</p>
              </div>
              <div className="rounded-xl border border-gold/40 bg-pitch/60 px-3 py-3">
                <p className="font-mono text-xl font-bold text-gold-bright">+{result.coinAwarded}</p>
                <p className="text-[11px] uppercase tracking-wider text-cream/50">Đô la Đạt</p>
              </div>
            </div>

            <p className={`mt-4 text-center text-sm ${passed ? "text-gold-bright" : "text-[#ff9d92]"}`}>
              {passed
                ? "Bạn đã mở khoá Thì tiếp theo! Về màn Chọn Thì để khám phá."
                : `Cần ít nhất ${level.passScore}% để hạ Trùm. Xem gợi ý bên dưới rồi thử lại nhé!`}
            </p>

            {/* Chi tiết từng câu */}
            <div className="mt-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const isCorrect =
                  JSON.stringify(answers[q.id]) === JSON.stringify(result.correctAnswers[q.id]);
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border px-4 py-3 ${
                      isCorrect ? "border-gold/25 bg-pitch/40" : "border-crimson/40 bg-crimson/10"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`font-mono font-bold ${isCorrect ? "text-gold-bright" : "text-[#ff9d92]"}`}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-cream/90">
                          <span className="font-mono text-[11px] text-cream/45 mr-1.5">Câu {i + 1}</span>
                          {q.prompt}
                        </p>
                        {q.payload?.hint && (
                          <p className="mt-1 text-xs text-gold-deep">💡 {q.payload.hint}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-2.5 justify-center">
              {passed ? (
                <Button size="lg" onClick={() => navigate("/tenses")}>Về Chọn Thì 🗺</Button>
              ) : (
                <>
                  <Button size="lg" variant="danger" onClick={resetQuiz}>Chơi lại ⚔️</Button>
                  <Button size="lg" variant="secondary" onClick={() => navigate("/tenses")}>Về Chọn Thì</Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </PageShell>
    );
  }

  /* ---------------- Màn trận đấu ---------------- */
  return (
    <PageShell user={user} onLogout={handleLogout} active="levels">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-crimson">⚔️ Boss Battle</p>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-cream">
              {level.name}
            </h2>
          </div>
          <span className="font-mono text-xs text-cream/55">
            Câu {Math.min(index + 1, total)}/{total} · Cần ≥{level.passScore}%
          </span>
        </div>

        {/* Thanh máu */}
        <div className="flex items-center gap-4">
          <HpBar label="Bạn" hp={playerHp} emoji={PLAYER_EMOJI} tone="player" hit={playerHit} />
          <span className="font-display font-extrabold text-2xl text-crimson select-none">VS</span>
          <HpBar label={BOSS_NAME} hp={bossHp} emoji={BOSS_EMOJI} tone="boss" hit={bossHit} alignRight />
        </div>

        {/* Đấu trường */}
        <div className="relative mt-5 h-32 rounded-2xl border border-gold/20 bg-gradient-to-b from-pitch/60 to-crimson/10 overflow-hidden">
          {/* Người chơi (trái) */}
          <div
            className={`absolute left-[6%] top-1/2 -translate-y-1/2 text-5xl sm:text-6xl ${
              shot === "player" ? "anim-lunge" : ""
            } ${playerHit ? "anim-hit" : ""}`}
            aria-hidden
          >
            {PLAYER_EMOJI}
          </div>
          {/* Boss (phải) */}
          <div
            className={`absolute right-[6%] top-1/2 -translate-y-1/2 text-5xl sm:text-6xl ${
              bossHit ? "anim-hit" : ""
            }`}
            aria-hidden
          >
            {BOSS_EMOJI}
          </div>
          {/* Đạn bay */}
          {shot === "player" && (
            <div className="anim-fly-to-boss absolute top-1/2 -translate-y-1/2 text-3xl" aria-hidden>⚡</div>
          )}
          {shot === "boss" && (
            <div className="anim-fly-to-player absolute top-1/2 -translate-y-1/2 text-3xl" aria-hidden>🔥</div>
          )}
          {/* Trạng thái giữa sân */}
          <div className="absolute inset-x-0 bottom-2 text-center">
            {phase === "submitting" && (
              <p className="font-mono text-xs text-gold-bright">
                Đang tung đòn quyết định<span className="cursor-blink">...</span>
              </p>
            )}
            {phase === "resolution" && (
              <p className="font-mono text-xs text-cream/60">
                Diễn lại trận đấu<span className="cursor-blink">...</span>
              </p>
            )}
          </div>
        </div>

        {/* Câu hỏi */}
        {phase !== "resolution" && (
          <Card shine className="mt-5 p-6 sm:p-8 border-2 border-crimson/30">
            <QuestionRenderer
              question={question}
              selected={selected}
              locked={phase !== "answering"}
              onSelect={handleSelect}
            />

            {submitError && (
              <div role="alert" className="anim-shake mt-5 rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-2.5 text-sm text-[#ff9d92]">
                {submitError}
              </div>
            )}
            {submitError && (
              <div className="mt-4 text-right">
                <Button variant="danger" onClick={() => void doSubmit(answers)}>Nộp bài lại 🏁</Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </PageShell>
  );
}
