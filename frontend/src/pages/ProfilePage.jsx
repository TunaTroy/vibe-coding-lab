import { Link } from "react-router-dom";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-cream mb-4">👤 Nhân Vật</h1>
        <p className="text-cream/60 mb-6">Tính năng đang được phát triển...</p>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-deep to-gold-bright text-pitch font-bold hover:brightness-110 transition-all"
        >
          ← Quay lại Trang Chủ
        </Link>
      </div>
    </div>
  );
}