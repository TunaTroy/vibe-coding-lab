import { useNavigate } from "react-router-dom";

import { Crest, displayName } from "./PageShell";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";

/* ============================================================
   TopBar — Header ứng dụng theo UI Spec:
   - Trái: Hamburger menu button + Breadcrumb "TRANG CHỦ / OLD TRAFFORD HQ"
   - Phải: Coin Badge + User Profile Pill (Avatar + Tên + Level)
   ============================================================ */

export default function TopBar({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const userInitial = displayName(user).charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#241f1f] to-[#141010] border-b border-gold/30 rounded-t-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
      {/* Cụm bên trái */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gold/25 text-cream hover:bg-gold/10 hover:border-gold/50 transition-all lg:hidden"
          aria-label="Mở menu"
        >
          <span className="text-xl">≡</span>
        </button>

        {/* Breadcrumb / Badge */}
        <div className="flex items-center gap-2">
          <Crest className="w-8 h-9" />
          <h1 className="font-display text-base sm:text-lg font-bold text-cream uppercase tracking-wider leading-tight">
            Trang Chủ <span className="text-gold-bright">/ Old Trafford HQ</span>
          </h1>
        </div>
      </div>

      {/* Cụm bên phải */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Coin Badge */}
        <div className="flex items-center gap-2 bg-[#0a160d]/50 rounded-xl px-3 py-2 border border-gold/20">
          <span className="text-lg" role="img" aria-label="coin">🪙</span>
          <span className="font-mono text-sm font-bold text-gold-bright leading-tight">
            {user.coinBalance.toLocaleString("vi-VN")}
          </span>
        </div>

        {/* User Profile Pill */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2.5 bg-gradient-to-br from-gold-deep/20 to-gold-bright/10 rounded-xl px-3 py-2 border border-gold/25 hover:border-gold/50 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-deep to-gold-bright flex items-center justify-center text-pitch font-bold text-sm">
            {userInitial}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-cream leading-tight">{displayName(user)}</p>
            <p className="text-[10px] text-gold-deep font-semibold">Cấp độ 7</p>
          </div>
        </button>
      </div>
    </header>
  );
}
