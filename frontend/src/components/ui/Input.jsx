import { useId, useState } from "react";

/* ============================================================
   Input — refactor từ components/reusable/Input.jsx
   Label + lỗi validate + nút ẩn/hiện mật khẩu.
   ============================================================ */

export default function Input({ label, error, type = "text", className = "", ...rest }) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gold mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          className={`w-full rounded-xl border bg-pitch/70 px-4 py-3 text-sm text-cream placeholder:text-cream/30
            outline-none transition-all duration-200
            ${
              error
                ? "border-crimson/70 focus:border-crimson focus:shadow-[0_0_0_3px_rgba(200,16,46,0.15)]"
                : "border-gold/25 focus:border-gold focus:shadow-[0_0_0_3px_rgba(240,192,64,0.12)]"
            }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="anim-rise mt-1.5 text-xs font-medium text-[#ff8a7a]">
          {error}
        </p>
      )}
    </div>
  );
}
