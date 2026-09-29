import Button from "../ui/Button";

export default function StudyModeCard({ onStart, tenses, loading, error, earnedStars }) {
  const names = tenses.map((tense) => tense.name).filter(Boolean);
  const curriculum = names.length === 1
    ? `Thì đang có trong học viện: ${names[0]}`
    : names.length > 1
      ? `${names.length} thì đang có trong học viện`
      : "Khám phá các thì tiếng Anh qua từng trận học";

  return (
    <section className="home-hero relative isolate flex min-h-[440px] flex-col overflow-hidden rounded-[28px] border border-gold/25 px-6 pb-7 pt-7 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:px-10 sm:pb-10 sm:pt-9 lg:min-h-[490px] lg:px-12" aria-labelledby="home-hero-title">
      <div className="home-hero-light pointer-events-none absolute inset-0" aria-hidden />
      <div className="home-hero-field pointer-events-none absolute inset-0" aria-hidden />
      <div className="home-hero-circle pointer-events-none absolute -bottom-36 -right-24 h-[450px] w-[450px] rounded-full sm:-bottom-48 sm:right-0 sm:h-[580px] sm:w-[580px]" aria-hidden />
      <div className="pointer-events-none absolute right-[12%] top-[-120px] h-[260px] w-[260px] rounded-full bg-gold/5 blur-3xl" aria-hidden />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-night/45 px-4 py-2 text-xs font-bold tracking-[0.1em] text-gold-bright sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-crimson shadow-[0_0_10px_rgba(200,16,46,0.8)]" aria-hidden />
          SÂN HỌC TẬP
        </span>
        {earnedStars !== null && <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-night/55 px-3 py-2 text-xs font-bold text-gold-bright sm:text-sm"><span aria-hidden>★</span>{earnedStars} sao</span>}
      </div>

      <div className="relative z-10 mt-auto max-w-[700px] pt-14">
        <p className="mb-3 text-sm font-bold text-gold-bright sm:text-base">Sẵn sàng vào sân?</p>
        <h1 id="home-hero-title" className="max-w-[680px] font-display text-[clamp(2.5rem,5vw,5rem)] font-black leading-[1.02] tracking-[-0.04em] text-cream">
          Học tiếng Anh.<br /><span className="text-gold-bright">Chinh phục từng thì.</span>
        </h1>
        <p className="mt-5 max-w-[540px] text-base leading-relaxed text-cream/80 sm:text-lg">
          {loading ? "Đang tìm bài học cho bạn..." : error ? "Chọn bài học để bắt đầu luyện tập nhé." : curriculum}
        </p>
        <Button variant="danger" size="lg" onClick={onStart} className="mt-7 min-h-14 w-full text-base shadow-[0_5px_0_#7a0f1e,0_12px_24px_rgba(0,0,0,0.35)] sm:w-auto sm:min-w-[260px]">
          Tiếp tục học <span aria-hidden>→</span>
        </Button>
      </div>
      <div className="pointer-events-none absolute bottom-5 right-7 hidden items-center gap-2 text-xs font-medium tracking-[0.15em] text-cream/45 lg:flex" aria-hidden>
        <span className="h-px w-12 bg-gold/40" /> VIBE ENGLISH LAB
      </div>
    </section>
  );
}
