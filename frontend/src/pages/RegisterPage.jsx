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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Create account</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Register</h1>
        </div>

        <div className="mb-4">
          <GoogleLoginButton onSuccess={handleGoogleLogin} disabled={submitting} />
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
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
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            error={fieldErrors.password?.[0]}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
