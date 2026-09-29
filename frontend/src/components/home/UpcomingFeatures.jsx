const FEATURES = ["Cửa hàng", "Chế độ Chiến"];

export default function UpcomingFeatures() {
  return (
    <section className="border-t border-gold/15 pt-6" aria-labelledby="upcoming-title">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 id="upcoming-title" className="text-sm font-semibold text-cream/70">Sắp ra mắt</h2>
        <p className="text-sm text-cream/60">Sân học viện sẽ còn nhiều điều thú vị.</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {FEATURES.map((name) => <div key={name} className="flex min-h-11 items-center gap-2 rounded-xl border border-gold/15 bg-cream/[0.03] px-4 text-sm text-cream/60">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          {name}
        </div>)}
      </div>
    </section>
  );
}
