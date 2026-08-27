import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import HomePage from "../pages/HomePage";
import LeaderboardPage from "../pages/LeaderboardPage";
import LevelSelectPage from "../pages/LevelSelectPage";
import LoginPage from "../pages/LoginPage";
import PlayLevelPage from "../pages/PlayLevelPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import ShopPage from "../pages/ShopPage";
import TodoPage from "../pages/TodoPage";
import WarModePage from "../pages/WarModePage";

/* ============================================================
   App — composition root: guards + route table.
   Khác App.jsx gốc:
   - guards đọc auth từ Context (không còn prop drilling)
   - THÊM route /todos (TodoPage gốc tồn tại nhưng chưa được wire)
   ============================================================ */

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center relative">
        <div className="arena-bg" aria-hidden />
        <div className="relative z-10 rounded-2xl border border-gold/30 bg-pitch/70 px-7 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <p className="font-mono text-sm text-gold-bright">
            Đang kiểm tra phiên<span className="cursor-blink">...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />

      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/levels"
        element={
          <ProtectedRoute>
            <LevelSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/play/:levelId"
        element={
          <ProtectedRoute>
            <PlayLevelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/todos"
        element={
          <ProtectedRoute>
            <TodoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/war-mode"
        element={
          <ProtectedRoute>
            <WarModePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
    </Routes>
  );
}
