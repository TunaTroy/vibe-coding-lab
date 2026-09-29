import { useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { Crest, displayName } from "./PageShell";

function pageLabel(path) {
  if (path === "/home") return "Sảnh học tập";
  if (path === "/leaderboard") return "Bảng xếp hạng";
  if (path.startsWith("/tenses") || path.startsWith("/play") || path === "/levels") return "Học tập";
  if (path === "/shop") return "Cửa hàng";
  if (path === "/war-mode") return "Chế độ Chiến";
  if (path === "/profile") return "Hồ sơ";
  return "Học viện";
}

export default function TopBar({ onMenuToggle, isMenuOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;

  return (
    <header className="relative z-10 flex min-h-[76px] items-center justify-between gap-3 border-b border-gold/15 bg-[#170f10]/80 px-4 sm:px-6 xl:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuToggle} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/25 text-cream transition-colors hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-bright xl:hidden" aria-label="Mở menu" aria-haspopup="dialog" aria-expanded={isMenuOpen}>
          <span className="text-2xl leading-none" aria-hidden>≡</span>
        </button>
        <Crest className="h-9 w-8 shrink-0 xl:hidden" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-cream sm:text-base">{pageLabel(location.pathname)}</p>
          <p className="hidden text-xs text-cream/50 sm:block">Mỗi bài học là một bước tiến</p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-gold/20 bg-gold/5 py-1.5 pl-1.5 pr-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-deep to-gold-bright font-bold text-pitch">{displayName(user).charAt(0).toUpperCase()}</div>
        <span className="hidden max-w-32 truncate text-sm font-semibold text-cream sm:block">{displayName(user)}</span>
      </div>
    </header>
  );
}
