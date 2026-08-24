import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/reusable/GoogleLoginButton';
import Button from '../components/reusable/Button';
import Card from '../components/reusable/Card';
import Input from '../components/reusable/Input';

function getErrorMessage(error) {
  if (error?.status === 400) {
    return error.errors?.email?.[0] || error.errors?.password?.[0] || error.data?.message || 'Validation failed.';
  }

  if (error?.status === 403) {
    return 'You do not have permission to do that.';
  }

  if (error?.status === 500) {
    return error.message || 'Server error. Please try again later.';
  }

  return error?.message || 'Unable to register right now.';
}

export default function RegisterPage({ onRegister, onGoogleLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    // Trim email to prevent accidental spaces
    const trimmedValue = name === 'email' ? value.trim() : value;
    setForm((current) => ({ ...current, [name]: trimmedValue }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: undefined }));
    }

    if (error) {
      setError('');
    }
  };

  const handleGoogleLogin = async (idToken) => {
    if (!onGoogleLogin) {
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await onGoogleLogin(idToken);
      navigate('/todos');
    } catch (err) {
      // Only show error message if it's not a generic 401 from session check
      if (err?.status === 401 && err?.message?.includes('Google authentication failed')) {
        setError('Google authentication failed. Please try again.');
      } else if (err?.status !== 401) {
        setError(getErrorMessage(err));
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      // Trim values before submit for safety
      const trimmedForm = {
        email: form.email.trim(),
        password: form.password.trim(),
      };
      await onRegister(trimmedForm);
      navigate('/todos');
    } catch (err) {
      // Don't show "session expired" for registration attempt failures
      if (err?.status === 401) {
        setError('Registration failed. Please try again.');
      } else {
        const message = getErrorMessage(err);
        setError(message);
      }
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#120c0c] px-4 py-10 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#120c0c] via-[#1a1a1a] to-[#2a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,_#4a1510_0%,_transparent_60%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* MUFC Crest */}
        <div className="text-center mb-6">
          <svg className="w-20 h-22 mx-auto mb-4 drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]" viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 2 L92 16 L92 52 C92 82 74 100 50 110 C26 100 8 82 8 52 L8 16 Z" fill="#DA291C" stroke="#F0C040" strokeWidth="3" />
            <path d="M50 8 L86 20 L86 52 C86 78 70 94 50 103 C30 94 14 78 14 52 L14 20 Z" fill="#131313" />
            <g fill="#F0C040">
              <path d="M50 26 c-3 0 -5 2 -5 5 c0 2 1 3.5 2.5 4.5 L46 44 h8 l-1.5 -8.5 C54 34.5 55 33 55 31 c0 -3 -2 -5 -5 -5 z" />
              <path d="M42 46 h16 l-2 34 c0 4 -3 8 -6 8 s-6 -4 -6 -8 z" />
              <path d="M36 30 l4 8 M64 30 l-4 8" stroke="#F0C040" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#DAA520]">Tạo tài khoản mới</p>
          <h1 className="mt-2 text-3xl font-bold text-[#F4E9CE] uppercase tracking-wider">Đăng Ký</h1>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <GoogleLoginButton onSuccess={handleGoogleLogin} disabled={submitting} />
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#F0C040]/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#F4E9CE]/60">hoặc</span>
            <div className="h-px flex-1 bg-[#F0C040]/30" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-md border border-[#C8102E]/30 bg-[#C8102E]/10 px-3 py-2 text-sm text-[#C8102E]">
                {error}
              </div>
            ) : null}

            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              error={fieldErrors.email?.[0]}
            />

            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tạo mật khẩu"
              autoComplete="new-password"
              error={fieldErrors.password?.[0]}
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#F4E9CE]/70">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-[#DAA520] hover:text-[#FFD700]">
              Đăng nhập ngay
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
