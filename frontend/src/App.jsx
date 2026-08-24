import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LevelSelect from './pages/LevelSelect';
import LoginPage from './pages/LoginPage';
import PlayLevel from './pages/PlayLevel';
import RegisterPage from './pages/RegisterPage';

// Component bọc bảo vệ Route yêu cầu đăng nhập
function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Component bọc Route công khai (Đã đăng nhập thì đẩy về /home)
function PublicRoute({ user, children }) {
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

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
      {/* Root Route */}
      <Route
        path="/"
        element={<Navigate to={auth.user ? '/home' : '/login'} replace />}
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute user={auth.user}>
            <LoginPage onLogin={auth.login} onGoogleLogin={auth.loginWithGoogle} />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute user={auth.user}>
            <RegisterPage onRegister={auth.register} onGoogleLogin={auth.loginWithGoogle} />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute user={auth.user}>
            <HomePage user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/levels"
        element={
          <ProtectedRoute user={auth.user}>
            <LevelSelect user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/play/:levelId"
        element={
          <ProtectedRoute user={auth.user}>
            <PlayLevel user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />

      {/* Wildcard Route (404/Fallback) */}
      <Route
        path="*"
        element={<Navigate to={auth.user ? '/home' : '/login'} replace />}
      />
    </Routes>
  );
}