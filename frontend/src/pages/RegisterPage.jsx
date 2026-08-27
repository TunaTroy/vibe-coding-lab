import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Crest } from "../components/layout/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import GoogleLoginButton from "../components/ui/GoogleLoginButton";
import Input from "../components/ui/Input";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

/* ============================================================
   RegisterPage — cùng pattern với LoginPage, thêm bước xác nhận
   mật khẩu phía client. Backend registerSchema yêu cầu
   password ≥ 8 ký tự.
   ============================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = {};
    if (!EMAIL_RE.test(email)) errs.email = "Email không đúng định dạng.";
    if (password.length < 8)
      errs.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (confirm !== password) errs.confirm = "Mật khẩu xác nhận chưa khớp.";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await register(email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      if (err?.status === 400 && err.errors) {
        setFieldErrors({
          email: err.errors.email?.[0],
          password: err.errors.password?.[0],
        });
      }
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setGoogleLoading(true);
    setServerError("");
    try {
      await loginWithGoogle(idToken);
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
              Gia Nhập <span className="text-gold-bright">Học Viện</span>
            </h1>
            <p className="mt-1 text-xs text-cream/55 uppercase tracking-[0.2em]">
              Bắt đầu hành trình chinh phục 12 thì
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="anim-shake mb-5 rounded-xl border border-crimson/60 bg-crimson/15 px-4 py-3 text-sm text-[#ff9d92]"
            >
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
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="new-password"
            />
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={fieldErrors.confirm}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Đang tạo tài khoản..." : "Đăng Ký 🔴"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gold/20" />
            <span className="text-[11px] uppercase tracking-widest text-cream/40">
              hoặc
            </span>
            <span className="h-px flex-1 bg-gold/20" />
          </div>

          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            disabled={googleLoading}
          />

          <p className="mt-6 text-center text-sm text-cream/60">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-bold text-gold-bright hover:underline underline-offset-4"
            >
              Đăng nhập
            </Link>
          </p>
        </Card>
      </Reveal>
    </div>
  );
}
