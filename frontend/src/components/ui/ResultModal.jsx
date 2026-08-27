import Button from "./Button";
import Card from "./Card";

/* ============================================================
   ResultModal — refactor từ components/reusable/ResultModal.jsx
   (kèm StarRating — trước là file riêng, nay ghép vào vì chỉ
   dùng duy nhất ở modal kết quả).
   ============================================================ */

function Star({ filled, delayMs }) {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      className={filled ? "anim-star drop-shadow-[0_0_10px_rgba(255,215,0,0.55)]" : "opacity-25"}
      style={{ animationDelay: `${delayMs}ms` }}
      fill={filled ? "var(--color-gold-bright)" : "none"}
      stroke={filled ? "var(--color-gold-deep)" : "var(--color-cream)"}
      strokeWidth="1.4"
      strokeLinejoin="round"
    >
      <path d="M12 2l2.9 6.26L21.5 9.3l-4.75 4.4 1.15 6.8L12 17.3l-5.9 3.2 1.15-6.8L2.5 9.3l6.6-1.04L12 2z" />
    </svg>
  );
}

export default function ResultModal({
  stars,
  maxStars,
  correctCount,
  totalQuestions,
  coinsEarned,
  isWeekendBoost,
  onReplay,
  onContinue,
}) {
  const passed = stars > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-pitch/85 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Kết quả bài học"
    >
      <Card shine className="anim-pop-in w-full max-w-md p-8 border-2 border-gold/50 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold/70">
          {passed ? "Trận đấu kết thúc" : "Thua keo này, bày keo khác"}
        </p>
        <h2 className="font-display mt-2 text-3xl font-extrabold uppercase tracking-wide text-gold-bright">
          {passed ? "Chiến thắng!" : "Chưa đạt"}
        </h2>

        {/* Sao */}
        <div className="mt-5 flex items-end justify-center gap-2">
          {Array.from({ length: maxStars }, (_, i) => (
            <Star key={i} filled={i < stars} delayMs={250 + i * 220} />
          ))}
        </div>

        {/* Thống kê */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gold/20 bg-pitch/60 px-4 py-3">
            <p className="font-mono text-2xl font-bold text-cream">
              {correctCount}
              <span className="text-base text-cream/50">/{totalQuestions}</span>
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-cream/50">Câu đúng</p>
          </div>
          <div className="rounded-xl border border-gold/40 bg-pitch/60 px-4 py-3">
            <p className="font-mono text-2xl font-bold text-gold-bright">
              +{coinsEarned.toLocaleString("vi-VN")}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-cream/50">
              Đô la Đạt {isWeekendBoost && <span className="text-crimson font-bold">×2 🔥</span>}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          <Button size="lg" onClick={onContinue}>
            Tiếp tục hành trình ⚽
          </Button>
          <Button variant="secondary" onClick={onReplay}>
            Chơi lại level này
          </Button>
        </div>
      </Card>
    </div>
  );
}
