/* Brand helpers shared with the authenticated navigation and public auth pages. */

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

export default function PageShell({ children }) {
  return <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>;
}
