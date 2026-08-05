import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/reusable/Button';
import Card from '../components/reusable/Card';
import Input from '../components/reusable/Input';

function getErrorMessage(error) {
  if (error?.status === 400) {
    return error.errors?.email?.[0] || error.errors?.password?.[0] || error.data?.message || 'Validation failed.';
  }

  if (error?.status === 401) {
    return 'Your session has expired or you are not signed in.';
  }

  if (error?.status === 403) {
    return 'You do not have access to this action.';
  }

  if (error?.status === 500) {
    return error.message || 'Server error. Please try again later.';
  }

  return error?.message || 'Unable to login right now.';
}

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: undefined }));
    }

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await onLogin(form);
      navigate('/todos');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Login</h1>
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
            placeholder="Enter your password"
            autoComplete="current-password"
            error={fieldErrors.password?.[0]}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}
