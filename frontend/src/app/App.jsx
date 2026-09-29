import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import HomePage from "../pages/HomePage";
import LeaderboardPage from "../pages/LeaderboardPage";
import LevelSelectPage from "../pages/LevelSelectPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import PlayLevelPage from "../pages/PlayLevelPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import ShopPage from "../pages/ShopPage";
import TenseSelectPage from "../pages/TenseSelectPage";
import TodoPage from "../pages/TodoPage";
import WarModePage from "../pages/WarModePage";
import BossBattlePage from "../pages/BossBattlePage";

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

      {/* One navigation shell for every authenticated screen. */}
      <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/tenses" element={<TenseSelectPage />} />
        <Route path="/tenses/:tenseId/levels" element={<LevelSelectPage />} />
        <Route path="/levels" element={<Navigate to="/tenses" replace />} />
        <Route path="/play/:levelId" element={<PlayLevelPage />} />
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/war-mode" element={<WarModePage />} />
      </Route>

      <Route path="/bosses/:bossId" element={<ProtectedRoute><BossBattlePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
