import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { Crest, displayName } from "./PageShell";

const PRIMARY = [
  { to: "/home", label: "Trang chủ", icon: "home" },
  { to: "/tenses", label: "Học tập", icon: "book" },
  { to: "/leaderboard", label: "Bảng xếp hạng", icon: "trophy" },
];
const UPCOMING = [
  { label: "Cửa hàng", icon: "shop" },
  { label: "Chế độ Chiến", icon: "shield" },
];

function NavIcon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10H3z" /><path d="M9 20v-7h6v7" /></>,
    book: <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z" /><path d="M12 6v14" /></>,
    trophy: <><path d="M7 3h10v7a5 5 0 0 1-10 0V3Z" /><path d="M7 5H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4M12 15v4m-4 2h8" /></>,
    shop: <><path d="M4 9h16v12H4zM3 9l2-6h14l2 6M9 21v-7h6v7" /></>,
    shield: <><path d="M12 2 20 5v6c0 5-3 9-8 11-5-2-8-6-8-11V5z" /><path d="m9 12 2 2 4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3-7 8-7s8 3 8 7" /></>,
    logout: <><path d="M10 3H4v18h6M14 8l5 4-5 4M9 12h10" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden>{paths[name]}</svg>;
}

function SidebarContents({ onClose, onLogout }) {
  const { user } = useAuth();
  const location = useLocation();
  const learningActive = location.pathname.startsWith("/tenses") || location.pathname.startsWith("/play") || location.pathname === "/levels";

  return (
    <>
      <div className="flex items-center gap-3 px-5 pb-7 pt-6">
        <Crest className="h-12 w-11 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">Vibe English Lab</p>
          <p className="mt-0.5 font-display text-base font-extrabold leading-tight text-cream">Football Academy</p>
        </div>
        <button type="button" onClick={onClose} className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/25 text-cream xl:hidden" aria-label="Đóng menu">✕</button>
      </div>

      <nav className="flex-1 px-3" aria-label="Điều hướng chính">
        <p className="px-3 pb-2 text-xs font-semibold text-cream/50">Học tập</p>
        <div className="space-y-1">
          {PRIMARY.map((item) => {
            const active = item.to === "/tenses" ? learningActive : location.pathname === item.to;
            return <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl border-l-[3px] px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-bright ${active ? "border-crimson bg-gradient-to-r from-crimson/25 to-transparent text-cream shadow-[inset_0_0_0_1px_rgba(240,192,64,0.18)]" : "border-transparent text-cream/70 hover:bg-cream/5 hover:text-cream"}`}
            ><NavIcon name={item.icon} />{item.label}</NavLink>;
          })}
        </div>

        <div className="my-6 border-t border-gold/15" />
        <p className="px-3 pb-2 text-xs font-semibold text-cream/50">Sắp ra mắt</p>
        <div className="space-y-1">
          {UPCOMING.map((item) => (
            <div key={item.label} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm text-cream/55" aria-label={`${item.label}, sắp ra mắt`}>
              <NavIcon name={item.icon} /><span>{item.label}</span>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-gold/15 px-3 pb-5 pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/15 font-bold text-gold-bright">{displayName(user).charAt(0).toUpperCase()}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-cream">{displayName(user)}</p><p className="text-xs text-cream/50">Học viên</p></div>
        </div>
        <div className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-cream/55" aria-label="Hồ sơ, sắp ra mắt"><NavIcon name="user" />Hồ sơ <span className="ml-auto text-xs">Sắp ra mắt</span></div>
        <button type="button" onClick={onLogout} className="mt-1 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-cream/70 transition-colors hover:bg-crimson/15 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-bright"><NavIcon name="logout" />Đăng xuất</button>
      </div>
    </>
  );
}

export default function SidebarNav({ isOpen, onClose, onLogout }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeys = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = [...(drawerRef.current?.querySelectorAll("button, a[href]") ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeys);
    drawerRef.current?.querySelector('button[aria-label="Đóng menu"]')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeys);
      document.querySelector('button[aria-label="Mở menu"]')?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <>
      <aside className="hidden h-screen min-w-0 flex-col overflow-y-auto border-r border-gold/15 bg-[#140f10]/95 shadow-[8px_0_32px_rgba(0,0,0,0.2)] xl:sticky xl:top-0 xl:flex">
        <SidebarContents onClose={onClose} onLogout={onLogout} />
      </aside>
      {isOpen && <>
        <button type="button" className="fixed inset-0 z-40 bg-black/75 backdrop-blur-[2px] xl:hidden" onClick={onClose} aria-label="Đóng menu" />
        <aside ref={drawerRef} role="dialog" aria-modal="true" className="fixed inset-y-0 left-0 z-50 flex w-[min(280px,calc(100vw-40px))] flex-col overflow-y-auto border-r border-gold/25 bg-[#181112] shadow-[12px_0_40px_rgba(0,0,0,0.6)] xl:hidden" aria-label="Menu điều hướng">
          <SidebarContents onClose={onClose} onLogout={onLogout} />
        </aside>
      </>}
    </>
  );
}
