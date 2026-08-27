import Button from "../ui/Button";
import Card from "../ui/Card";

/* ============================================================
   StudyModeCard — tách từ "Chế Độ Học" trong HomePage.jsx gốc.
   ============================================================ */

const UPCOMING_CHAPTERS = [
  { order: 2, title: "Câu Bị Động" },
  { order: 3, title: "Câu Ước" },
];

export default function StudyModeCard({ levelsCount, onStart }) {
  return (
    <Card shine className="p-6 border-2 border-gold-deep/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-deep/20 to-transparent pointer-events-none" aria-hidden />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gold-bright uppercase tracking-wider mb-1">
            📚 Chế Độ Học
          </h2>
          <p className="text-sm text-cream/80">Rèn Tiếng Anh mỗi ngày</p>
        </div>
        <div className="text-4xl" aria-hidden>🎯</div>
      </div>

      <p className="text-cream/70 mb-6">Thử thách 3 chương ngữ pháp cốt lõi</p>

      <div className="space-y-3 mb-6">
        {/* Chương 1 — hoạt động */}
        <button
          type="button"
          onClick={onStart}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-crimson/40 to-ember/40 border border-gold-deep/50 hover:border-gold-bright hover:shadow-[0_0_18px_rgba(255,215,0,0.15)] transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-bright flex items-center justify-center text-pitch font-bold">1</div>
            <div className="text-left">
              <p className="font-bold text-cream group-hover:text-gold-bright transition-colors">12 Thì Tiếng Anh</p>
              <p className="text-xs text-cream/60">{levelsCount} levels • Sẵn sàng</p>
            </div>
          </div>
          <span className="text-gold-bright text-xl transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>

        {/* Chương 2, 3 — sắp ra mắt */}
        {UPCOMING_CHAPTERS.map((ch) => (
          <button
            key={ch.order}
            type="button"
            disabled
            className="w-full flex items-center justify-between p-4 rounded-xl bg-pitch/40 border border-gold/15 opacity-60 cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cream/15 flex items-center justify-center text-cream/60 font-bold">
                {ch.order}
              </div>
              <div className="text-left">
                <p className="font-bold text-cream/60">{ch.title}</p>
                <p className="text-xs text-cream/40">Coming Soon</p>
              </div>
            </div>
            <span className="text-gold/40 text-xl" aria-hidden>🔒</span>
          </button>
        ))}
      </div>

      <Button size="lg" className="w-full" onClick={onStart}>
        Vào Học Ngay 🚀
      </Button>
    </Card>
  );
}
