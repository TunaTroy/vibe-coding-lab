/* ============================================================
   Button — refactor từ components/reusable/Button.jsx
   Thêm variant "danger", giữ hiệu ứng nhấn 3D kiểu game.
   ============================================================ */

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-gold-deep to-gold-bright text-pitch font-bold " +
    "shadow-[0_4px_0_var(--color-gold-dark),0_6px_12px_rgba(0,0,0,0.3)]",
  secondary:
    "border border-gold/40 text-cream font-semibold hover:bg-gold/10 hover:border-gold/70",
  danger:
    "bg-gradient-to-r from-crimson to-ember text-cream font-bold " +
    "shadow-[0_4px_0_#7a0f1e,0_6px_12px_rgba(0,0,0,0.3)]",
  ghost: "text-cream/70 hover:text-gold-bright font-semibold",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

export default function Button({ variant = "primary", size = "md", className = "", children, ...rest }) {
  return (
    <button
      className={`btn-game inline-flex items-center justify-center gap-2 uppercase tracking-wider transition-all
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
