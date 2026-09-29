import { useNavigate } from "react-router-dom";

import Card from "../ui/Card";
import Button from "../ui/Button";

/* ============================================================
   EventBanner — Footer banner sự kiện theo UI Spec:
   - Trái: Thông báo sự kiện cuối tuần
   - Phải: 3 icon buttons (🛡️ ⚔️ 🎒) + Action button "Cửa hàng"
   ============================================================ */

export default function EventBanner() {
  const navigate = useNavigate();

  return (
    <Card className="p-4 border-t-2 border-gold/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Bên trái: Thông báo sự kiện */}
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>⭐</span>
          <p className="text-sm font-semibold text-cream">
            Chế độ Chiến đang được chuẩn bị · Sắp ra mắt
          </p>
        </div>

        {/* Bên phải: Quick actions */}
        <div className="flex items-center gap-2">
          {/* 3 Icon buttons */}
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gold/25 bg-pitch/40 text-cream hover:bg-gold/10 hover:border-gold/50 transition-all"
            title="Trang chủ"
          >
            <span className="text-base" aria-hidden>🛡️</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/war-mode")}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gold/25 bg-pitch/40 text-cream hover:bg-gold/10 hover:border-gold/50 transition-all"
            title="Chế độ chiến"
          >
            <span className="text-base" aria-hidden>⚔️</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gold/25 bg-pitch/40 text-cream hover:bg-gold/10 hover:border-gold/50 transition-all"
            title="Nhân vật"
          >
            <span className="text-base" aria-hidden>🎒</span>
          </button>

          {/* Action button chính */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/shop")}
            className="ml-2"
          >
            🛒 Cửa hàng · Sắp ra mắt
          </Button>
        </div>
      </div>
    </Card>
  );
}
