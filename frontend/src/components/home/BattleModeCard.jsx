import { useEffect, useState } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";

/* ============================================================
   BattleModeCard — Cập nhật theo UI Spec mới:
   - Header: "THỨ 7 & CHỦ NHẬT" + "CHẾ ĐỘ CHIẾN" + Icon ⚔️
   - Description ngắn về cách chơi
   - Center Lock Overlay với icon đồng hồ, đếm ngược, nút khóa
   - Chỉ mở vào T7 & CN, ngày thường DISABLE + đếm ngược
   ============================================================ */

export function getWeekendEventStatus(now = new Date()) {
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6; // 0 = Chủ Nhật, 6 = Thứ 7

  if (isWeekend) {
    return {
      status: "active",
      message: "🔥 Đang diễn ra — Kết thúc vào Chủ Nhật 23:59!",
      daysUntil: 0
    };
  }

  // Tính số ngày còn lại đến Thứ 7
  const daysUntilSaturday = 6 - day;
  return {
    status: "locked",
    message: `Mở lại sau ${daysUntilSaturday} ngày`,
    daysUntil: daysUntilSaturday
  };
}

export default function BattleModeCard() {
  const [countdown, setCountdown] = useState(getWeekendEventStatus());

  // Update countdown mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getWeekendEventStatus(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const active = countdown.status === "active";

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
        Làm bài tập để nhận Đô la Đạt, dùng Coin mua trang bị cho nhân vật
      </p>

      {/* Center Lock Overlay */}
      <div className="flex flex-col items-center justify-center py-8 px-4">
        {active ? (
          /* Trạng thái ACTIVE */
          <div className="text-center">
            <div className="text-5xl mb-3 animate-pulse" aria-hidden>🔥</div>
            <p className="font-bold text-gold-bright text-sm mb-1">
              Sự kiện đang diễn ra!
            </p>
            <p className="text-xs text-cream/60 mb-4">
              Tham gia ngay để nhận phần thưởng đặc biệt
            </p>
            <Button variant="danger" className="w-full uppercase tracking-wider">
              Tham Gia Chiến Trận ⚔️
            </Button>
          </div>
        ) : (
          /* Trạng thái LOCKED */
          <div className="text-center">
            <div className="text-5xl mb-3" aria-hidden>🕒</div>
            <p className="font-bold text-cream/80 text-sm mb-1">
              {countdown.message}
            </p>
            <p className="text-xs text-cream/40 mb-4">
              Mở cửa vào Thứ 7 & Chủ Nhật hàng tuần
            </p>
            <Button
              variant="secondary"
              className="w-full uppercase tracking-wider opacity-60 cursor-not-allowed"
              disabled
            >
              🔒 Đã Khóa
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
