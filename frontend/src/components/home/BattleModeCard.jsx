import Button from "../ui/Button";
import Card from "../ui/Card";

/* ============================================================
   BattleModeCard — tách từ "Chế Độ Chiến Tranh" trong HomePage gốc.
   Logic sự kiện cuối tuần giữ nguyên như code gốc (widget UI;
   backend hiện chưa có nhân đôi coin cuối tuần).
   ============================================================ */

export function getWeekendEventStatus(now = new Date()) {
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  return isWeekend
    ? { status: "active", message: "🔥 Đang diễn ra — Kết thúc vào Chủ Nhật 23:59!" }
    : { status: "locked", message: "🔒 Đang khóa — Mở cửa vào Thứ 7 & Chủ Nhật" };
}

export default function BattleModeCard() {
  const eventStatus = getWeekendEventStatus();
  const active = eventStatus.status === "active";

  return (
    <Card shine className="p-6 border-2 border-crimson/30">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-crimson/20 to-transparent pointer-events-none" aria-hidden />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#e0394f] uppercase tracking-wider mb-1">
            ⚔️ Chế Độ Chiến Tranh
          </h2>
          <p className="text-sm text-cream/80">Đại Chiến Cuối Tuần</p>
        </div>
        <div className="text-4xl" aria-hidden>🏆</div>
      </div>

      <p className="text-cream/70 mb-4">Làm bài tập tích lũy Đô la Đạt &amp; Trang bị cho Nhân vật</p>

      <div
        className={`p-4 rounded-xl border mb-4 transition-colors duration-300 ${
          active ? "bg-gold-deep/20 border-gold-deep/50" : "bg-pitch/40 border-gold/25"
        }`}
      >
        <p className={`font-bold text-sm mb-1 ${active ? "text-gold-bright" : "text-cream/60"}`}>
          {eventStatus.message}
        </p>
        {!active && <p className="text-xs text-cream/40">Mở cửa vào Thứ 7 &amp; Chủ Nhật hàng tuần</p>}
      </div>

      <Button
        variant={active ? "danger" : "secondary"}
        className="w-full"
        disabled={!active}
        title={active ? undefined : "Sự kiện chỉ mở vào cuối tuần"}
      >
        {active ? "Tham Gia Chiến Trận ⚔️" : "Xem Chiến Trường & Trang Bị 👁"}
      </Button>
    </Card>
  );
}
