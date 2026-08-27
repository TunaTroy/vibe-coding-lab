import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Crest } from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

/* ============================================================
   LoginPage — refactor: nhận auth từ Context (bản gốc nhận qua
   props onLogin/onGoogleLogin từ App.jsx).
   ============================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = {};
    if (!EMAIL_RE.test(email)) errs.email = "Email không đúng định dạng.";
    if (!password) errs.password = "Vui lòng nhập mật khẩu.";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      if (err?.status === 400 && err.errors) {
        setFieldErrors({ email: err.errors.email?.[0], password: err.errors.password?.[0] });
      }
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setServerError("");
    try {
      await loginWithGoogle();
      navigate("/home", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">
      <div className="arena-bg" aria-hidden />
      <div className="arena-glow" aria-hidden />
      <div className="arena-noise" aria-hidden />

      <Reveal className="relative z-10 w-full max-w-md">
        <Card shine className="p-8 border-2 border-gold/40">
          <div className="text-center mb-7">
            <Crest className="w-16 h-[74px] mx-auto" />
            <h1 className="font-display mt-4 text-2xl font-extrabold uppercase tracking-wider text-cream">
              Old Trafford <span className="text-gold-bright">Academy</span>
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.28em] text-gold-deep">
              Vibe English Lab
            </p>
          </div>

          {serverError && (
            <div role="alert" className="anim-shake mb-5 rounded-xl border border-crimson/60 bg-crimson/15 px-4 py-3 text-sm text-[#ff9d92]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="hocvien@vibemail.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="current-password"
            />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Đang đăng nhập..." : "Đăng Nhập ⚽"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gold/20" />
            <span className="text-[11px] uppercase tracking-widest text-cream/40">hoặc</span>
            <span className="h-px flex-1 bg-gold/20" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="btn-game w-full flex items-center justify-center gap-2.5 rounded-xl bg-cream px-5 py-3 text-sm font-bold text-pitch shadow-[0_4px_0_#b8a97f] hover:bg-white disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? "Đang kết nối Google..." : "Đăng nhập với Google"}
          </button>

          <p className="mt-6 text-center text-sm text-cream/60">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-bold text-gold-bright hover:underline underline-offset-4">
              Đăng ký ngay
            </Link>
          </p>
        </Card>

        <p className="mt-4 text-center font-mono text-[11px] text-cream/35">
          Gọi API thật tại {`{VITE_API_URL}`} · phiên lưu trong cookie httpOnly
        </p>
      </Reveal>
    </div>
  );
}
