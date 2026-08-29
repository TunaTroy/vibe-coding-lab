import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import QuestionRenderer from "../components/quiz/QuestionRenderer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ResultModal from "../components/ui/ResultModal";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { fetchLevelQuestions, submitLevel } from "../services/levelService";

/* ============================================================
   PlayLevelPage — flow backend THẬT:
   1. GET  /api/levels/:id/questions  → { level, questions }
   2. Chọn đáp án từng câu (FE chỉ GIỮ lựa chọn, không chấm điểm —
      correctAnswer không bao giờ xuống FE trước khi submit)
   3. POST /api/levels/:id/submit { levelId, answers:[{questionId, answer:index}] }
      → backend chấm trong transaction, trả { score, stars,
        coinAwarded, correctAnswers } — FE KHÔNG tự tính.
   ============================================================ */

const MAX_STARS = 3; // backend: score≥90→3, ≥70→2, ≥passScore→1

export default function PlayLevelPage() {
  const { levelId = "" } = useParams();
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [phase, setPhase] = useState("answering"); // answering | selected | submitting | done
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    setData(null);
    setLoadError("");
    fetchLevelQuestions(levelId)
      .then((res) => mounted && setData(res))
      .catch((err) => mounted && setLoadError(getErrorMessage(err)));
    return () => {
      mounted = false;
    };
  }, [levelId]);

  const resetQuiz = useCallback(() => {
    setPhase("answering");
    setIndex(0);
    setAnswers({});
    setResult(null);
    setSubmitError("");
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loadError) {
    return (
      <PageShell user={user} onLogout={handleLogout} active="levels">
        <Card className="p-10 text-center max-w-lg mx-auto">
          <p className="text-3xl" aria-hidden>
            🟥
          </p>
          <p className="mt-3 text-sm text-cream/70">{loadError}</p>
          <Link to="/levels">
            <Button variant="secondary" className="mt-5">
              ← Quay lại danh sách level
            </Button>
          </Link>
        </Card>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell user={user} onLogout={handleLogout} active="levels">
        <div className="flex items-center justify-center py-24">
          <p className="font-mono text-sm text-cream/50">
            Đang tải level<span className="cursor-blink">...</span>
          </p>
        </div>
      </PageShell>
    );
  }

  const level = data.level;
  const questions = data.questions;
  const total = questions.length;
  const question = questions[index];
  const isLast = index === total - 1;
  const selected = answers[question.id] ?? null;

  const handleSelect = (optionIndex) => {
    if (phase !== "answering") return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
    setSubmitError("");
    setPhase("selected");
  };

  const handleSubmit = async () => {
    setPhase("submitting");
    try {
      const res = await submitLevel(
        level.id,
        questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] ?? -1,
        })),
      );
      setResult(res);

      // Backend đã cộng coin vào DB; cập nhật số dư hiển thị trong phiên
      // (GET /auth/me hiện không trả coinBalance — xem MIGRATION.md)
      if (res.coinAwarded > 0) {
        refreshUser({
          ...user,
          coinBalance: user.coinBalance + res.coinAwarded,
        });
      }
      setPhase("done");
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setPhase("selected");
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      setPhase("answering");
      return;
    }
    void handleSubmit();
  };

  // Số câu đúng để hiển thị trong modal — đếm TỪ correctAnswers của backend
  const correctCount = result
    ? questions.filter((q) => answers[q.id] === result.correctAnswers[q.id])
        .length
    : 0;

  const progressPct =
    total > 0 ? ((index + (phase !== "answering" ? 1 : 0)) / total) * 100 : 0;

  return (
    <PageShell user={user} onLogout={handleLogout} active="levels">
      <div className="max-w-3xl mx-auto">
        {/* Progress header */}
        <div className="flex items-center gap-4 mb-5">
          <Link
            to="/levels"
            className="font-mono text-xs text-cream/60 hover:text-gold-bright transition-colors shrink-0"
          >
            ← Levels
          </Link>
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1.5">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-cream">
                Level {level.order} · Đạt {level.passScore} điểm để qua
              </h2>
              <span className="font-mono text-xs text-cream/55">
                Câu {Math.min(index + 1, total)}/{total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gold/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <Card shine className="p-6 sm:p-8 border-2 border-gold/25">
          <QuestionRenderer
            question={question}
            selected={selected}
            locked={phase !== "answering"}
            onSelect={handleSelect}
          />

          {submitError && (
            <div
              role="alert"
              className="anim-shake mt-5 rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-2.5 text-sm text-[#ff9d92]"
            >
              {submitError}
            </div>
          )}

          {phase === "selected" && (
            <div className="anim-rise mt-7">
              {/* Vấn đề 4 [14]: gợi ý lý thuyết RIÊNG của từng câu (payload.hint) */}
              <div className="rounded-xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-cream/85">
                <span className="font-bold text-gold-bright">
                  💡 Mẹo lý thuyết:{" "}
                </span>
                {question.payload?.hint ||
                  "Đáp án của bạn sẽ được chấm khi nộp bài."}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleNext}>
                  {isLast ? "Nộp bài 🏁" : "Câu tiếp theo →"}
                </Button>
              </div>
            </div>
          )}

          {phase === "submitting" && (
            <div className="anim-rise mt-7 flex items-center justify-center gap-3 py-2">
              <p className="font-mono text-xs text-gold-bright">
                Đang chấm điểm<span className="cursor-blink">...</span>
              </p>
            </div>
          )}
        </Card>
      </div>

      {phase === "done" && result && (
        <ResultModal
          stars={result.stars}
          maxStars={MAX_STARS}
          correctCount={correctCount}
          totalQuestions={total}
          coinsEarned={result.coinAwarded}
          isWeekendBoost={false}
          onReplay={resetQuiz}
          onContinue={() => navigate("/levels")}
  
        />
      )}
    </PageShell>
  );
}
