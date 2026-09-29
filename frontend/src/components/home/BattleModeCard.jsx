import Button from "../ui/Button";
import Card from "../ui/Card";

/* ============================================================
   BattleModeCard — Cập nhật theo UI Spec mới:
   - Header: "THỨ 7 & CHỦ NHẬT" + "CHẾ ĐỘ CHIẾN" + Icon ⚔️
   - Description ngắn về cách chơi
   - Hiện trạng thái sắp ra mắt vì chưa có luồng chơi thật
   ============================================================ */

export default function BattleModeCard() {
  return (
    <Card shine className="p-6 border-2 border-crimson/30 relative overflow-hidden">
      {/* Glow effect góc phải */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-crimson/20 to-transparent pointer-events-none" aria-hidden />

      {/* Header Card */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-cream/70 uppercase tracking-wider mb-1">
            Thứ 7 & Chủ Nhật
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#e0394f] uppercase tracking-wider">
            Chế Độ Chiến
          </h2>
        </div>
        <div className="text-3xl sm:text-4xl" aria-hidden>⚔️</div>
      </div>

      {/* Description */}
      <p className="text-cream/70 text-sm mb-5">
        Thử thách cuối tuần đang được chuẩn bị cho các học viên
      </p>

      {/* Center Lock Overlay */}
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="text-center">
          <div className="text-5xl mb-3" aria-hidden>🛠️</div>
          <p className="font-bold text-cream/80 text-sm mb-1">Đang chuẩn bị sân đấu</p>
          <p className="text-xs text-cream/50 mb-4">
            Chế độ này chưa mở. Hãy tiếp tục luyện tập nhé!
          </p>
          <Button variant="secondary" className="w-full uppercase tracking-wider" disabled>
            Sắp Ra Mắt
          </Button>
        </div>
      </div>
    </Card>
  );
}
