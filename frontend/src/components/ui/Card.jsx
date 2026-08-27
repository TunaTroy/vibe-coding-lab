/* ============================================================
   Card — refactor từ components/reusable/Card.jsx
   Nền card chuẩn của theme (gradient than + viền vàng mờ).
   ============================================================ */

export default function Card({ children, shine = false, className = "", ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-gold/20 bg-gradient-to-br from-[#241f1f] to-[#161010]
        shadow-[0_4px_16px_rgba(0,0,0,0.35)] ${shine ? "card-shine" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
