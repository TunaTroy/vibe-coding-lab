import Button from "../ui/Button";
import Card from "../ui/Card";

/* ============================================================
   StudyModeCard — Cập nhật theo UI Spec mới:
   - Header: "KHÔNG GIỚI HẠN THỜI GIAN" + "CHẾ ĐỘ HỌC" + Icon 📖
   - Danh sách chương với progress bar ASCII
   - Footer: Nút "TIẾP TỤC HỌC"
   ============================================================ */

const UPCOMING_CHAPTERS = [
  { order: 2, title: "Câu Bị Động" },
  { order: 3, title: "Câu Ước" },
];

export default function StudyModeCard({ levelsCount, onStart }) {
  return (
    <Card shine className="p-6 border-2 border-gold-deep/50 relative overflow-hidden">
      {/* Glow effect góc phải */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-deep/20 to-transparent pointer-events-none" aria-hidden />

      {/* Header Card */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-bold text-cream/70 uppercase tracking-wider mb-1">
            Không Giới Hạn Thời Gian
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-bright uppercase tracking-wider">
            Chế Độ Học
          </h2>
        </div>
        <div className="text-3xl sm:text-4xl" aria-hidden>📖</div>
      </div>

      {/* Danh sách chương */}
      <div className="space-y-3 mb-6">
        {/* Chương 1 — Active với Progress Bar */}
        <button
          type="button"
          onClick={onStart}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-crimson/40 to-ember/40 border border-gold-deep/50 hover:border-gold-bright hover:shadow-[0_0_18px_rgba(255,215,0,0.15)] transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gold-bright flex items-center justify-center text-pitch font-bold text-sm shrink-0">
              ①
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-cream group-hover:text-gold-bright transition-colors text-sm sm:text-base truncate">
                Chương 1: 12 Thì trong Tiếng Anh
              </p>
              {/* Progress Bar ASCII */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2 bg-pitch/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-deep to-gold-bright rounded-full transition-all duration-300"
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
            </div>
          </div>
          <span className="text-gold-bright text-xl ml-3 transition-transform duration-200 group-hover:translate-x-1 shrink-0">→</span>
        </button>

        {/* Chương 2 — Available */}
        <button
          type="button"
          onClick={onStart}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-pitch/40 border border-gold/25 hover:border-gold/50 hover:bg-gold/5 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cream/15 flex items-center justify-center text-cream font-bold text-sm shrink-0">
              ②
            </div>
            <div className="text-left">
              <p className="font-bold text-cream group-hover:text-gold-bright transition-colors text-sm sm:text-base">
                Chương 2: Câu Bị Động
              </p>
            </div>
          </div>
          <span className="text-gold/60 text-xl ml-3 transition-transform duration-200 group-hover:translate-x-1 shrink-0">→</span>
        </button>

        {/* Chương 3 — Locked */}
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-between p-4 rounded-xl bg-pitch/40 border border-gold/15 opacity-60 cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cream/10 flex items-center justify-center text-cream/40 text-sm shrink-0">
              🔒
            </div>
            <div className="text-left">
              <p className="font-bold text-cream/50 text-sm sm:text-base">
                Chương 3: Câu Ước
              </p>
            </div>
          </div>
          <span className="text-gold/40 text-xl ml-3 shrink-0">→</span>
        </button>
      </div>

      {/* Footer: Nút TIẾP TỤC HỌC */}
      <Button size="lg" className="w-full uppercase tracking-wider" onClick={onStart}>
        Tiếp Tục Học
      </Button>
    </Card>
  );
}