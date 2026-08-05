import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodoPage from './pages/TodoPage';

export default function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={auth.user ? '/todos' : '/login'} replace />} />
      <Route
        path="/login"
        element={auth.user ? <Navigate to="/todos" replace /> : <LoginPage onLogin={auth.login} />}
      />
      <Route
        path="/register"
        element={auth.user ? <Navigate to="/todos" replace /> : <RegisterPage onRegister={auth.register} />}
      />
      <Route
        path="/todos"
        element={auth.user ? <TodoPage user={auth.user} onLogout={auth.logout} /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={auth.user ? '/todos' : '/login'} replace />} />
    </Routes>
  );
}
