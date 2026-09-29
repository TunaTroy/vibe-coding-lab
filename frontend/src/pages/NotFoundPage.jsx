import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function NotFoundPage() {
  const { user } = useAuth();
  const destination = user ? "/home" : "/login";

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">
      <div className="arena-bg" aria-hidden />
      <div className="arena-glow" aria-hidden />
      <div className="relative z-10 w-full max-w-md rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-[#241f1f] to-[#161010] p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
        <p className="text-5xl" aria-hidden>🧭</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-gold-deep">404 · Lạc đường rồi</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-wide text-cream">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-cream/70">
          Trang này không tồn tại hoặc đã được chuyển sang nơi khác.
        </p>
        <Link
          to={destination}
          className="btn-game mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-deep to-gold-bright px-6 py-3 font-bold uppercase tracking-wider text-pitch shadow-[0_4px_0_var(--color-gold-dark),0_6px_12px_rgba(0,0,0,0.3)]"
        >
          {user ? "Về trang chủ" : "Về đăng nhập"}
        </Link>
      </div>
    </div>
  );
}
