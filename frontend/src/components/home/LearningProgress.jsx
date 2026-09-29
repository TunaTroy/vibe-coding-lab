export default function LearningProgress({ levels, tenseCount, loading, error, onRetry }) {
  const stars = levels.reduce((total, level) => total + (Number(level.starsEarned) || 0), 0);
  const learned = levels.filter((level) => level.starsEarned > 0).length;

  return (
    <section className="achievement-panel relative overflow-hidden rounded-3xl border border-gold/25 px-5 py-6 sm:px-8 sm:py-7" aria-labelledby="achievement-title">
      <div className="absolute -left-10 -top-20 h-48 w-48 rounded-full bg-gold/10 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex items-center gap-5 sm:min-w-[225px]">
          <div className="achievement-medal flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-gold/60 text-4xl text-gold-bright sm:h-24 sm:w-24" aria-hidden>★</div>
          <div>
            <p className="text-sm font-semibold text-gold-bright">Thành tích của bạn</p>
            <h2 id="achievement-title" className="mt-1 font-display text-2xl font-extrabold text-cream sm:text-3xl">Bộ sưu tập sao</h2>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {loading ? <p className="text-sm text-cream/65">Đang tải thành tích...</p> : error ? (
            <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-cream/70">
              <span>Chưa tải được thành tích.</span>
              <button type="button" onClick={onRetry} className="min-h-11 font-bold text-gold-bright underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-bright">Thử lại</button>
            </div>
          ) : levels.length === 0 ? <p className="text-sm text-cream/70">Chưa có level nào. Hãy xem các bài học hiện có nhé!</p> : <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-display text-4xl font-black leading-none text-gold-bright sm:text-5xl">{stars}<span className="ml-1 text-2xl">★</span></p>
              <p className="text-base text-cream/80">đã kiếm được</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-cream/75">
              <span><strong className="text-cream">{learned}/{levels.length}</strong> level có sao</span>
              {tenseCount !== null && <span><strong className="text-cream">{tenseCount}</strong> thì có trong học viện</span>}
            </div>
            <div className="mt-4 h-2 max-w-xl overflow-hidden rounded-full bg-cream/15" role="img" aria-label={`${learned} trong ${levels.length} level đã có sao`}>
              <div className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright shadow-[0_0_8px_rgba(240,192,64,0.25)]" style={{ width: `${(learned / levels.length) * 100}%` }} />
            </div>
          </>}
        </div>
      </div>
    </section>
  );
}
