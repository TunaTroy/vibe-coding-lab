import Button from "../ui/Button";

/* ============================================================
   PageShell — khung trang dùng chung cho các trang đã đăng nhập
   (nền sân vận động + header logo/stats/logout + container).
   Trước đây phần này bị copy-paste trong từng page.
   ============================================================ */

/** Huy hiệu Quỷ Đỏ — tách từ SVG inline trong HomePage.jsx gốc. */
export function Crest({ className = "w-12 h-14" }) {
  return (
    <svg className={`${className} drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]`} viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M50 2 L92 16 L92 52 C92 82 74 100 50 110 C26 100 8 82 8 52 L8 16 Z" fill="#DA291C" stroke="#F0C040" strokeWidth="3" />
      <path d="M50 8 L86 20 L86 52 C86 78 70 94 50 103 C30 94 14 78 14 52 L14 20 Z" fill="#131313" />
      <g fill="#F0C040">
        <path d="M50 26 c-3 0 -5 2 -5 5 c0 2 1 3.5 2.5 4.5 L46 44 h8 l-1.5 -8.5 C54 34.5 55 33 55 31 c0 -3 -2 -5 -5 -5 z" />
        <path d="M42 46 h16 l-2 34 c0 4 -3 8 -6 8 s-6 -4 -6 -8 z" />
        <path d="M36 30 l4 8 M64 30 l-4 8" stroke="#F0C040" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function displayName(user) {
  return user.email.split("@")[0] || "Học Viên";
}

export default function PageShell({ user, onLogout, children }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="arena-bg" aria-hidden />
      <div className="arena-glow" aria-hidden />
      <div className="arena-noise" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gradient-to-r from-[#241f1f] to-[#141010] border border-gold/30 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <Crest />
            <div>
              <h1 className="font-display text-xl font-bold text-cream uppercase tracking-wider leading-tight">
                Old Trafford <span className="text-gold-bright">Academy</span>
              </h1>
              <p className="text-[11px] text-cream/60 uppercase tracking-[0.2em]">Vibe English Lab</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 bg-[#0a160d]/50 rounded-xl px-4 py-2 border border-gold/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-deep to-gold-bright flex items-center justify-center text-pitch font-bold">
                {displayName(user).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-cream leading-tight">{displayName(user)}</p>
                <p className="text-[11px] text-gold-deep font-semibold">Lv. 5 · Chiến Binh {user.role === "ADMIN" && "· HLV"}</p>
              </div>
            </div>

            <div className="h-9 w-px bg-gold/25" />

            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="coin">💰</span>
              <div>
                <p className="font-mono text-sm font-bold text-gold-bright leading-tight">
                  {user.coinBalance.toLocaleString("vi-VN")}
                </p>
                <p className="text-[11px] text-cream/60">Đô la Đạt</p>
              </div>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={onLogout}>
            Đăng xuất
          </Button>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
