import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ============================================================
   SidebarNav — Drawer menu off-canvas (slide-out từ trái)
   - Nút đóng X ở góc trên phải
   - Danh sách điều hướng với highlight active tab theo useLocation()
   - Overlay mờ khi mở menu
   ============================================================ */

const NAV_ITEMS = [
  { to: "/home", label: "Trang Chủ", icon: "🏠" },
  { to: "/levels", label: "Chế Độ Học", icon: "📚" },
  { to: "/war-mode", label: "Chế Độ Chiến", icon: "⚔️" },
  { to: "/shop", label: "Cửa Hàng", icon: "🛒" },
  { to: "/leaderboard", label: "Bảng Xếp Hạng", icon: "🏆" },
  { to: "/profile", label: "Nhân Vật", icon: "👤" },
];

export default function SidebarNav({ isOpen, onClose, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  // Đóng menu khi nhấn ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleNavClick = (to) => {
    navigate(to);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay mờ */}
      <div
        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer slide-out */}
      <aside
        className="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-[#241f1f] to-[#141010] border-r border-gold/25 z-50 transform transition-transform duration-300 ease-out shadow-[8px_0_24px_rgba(0,0,0,0.4)]"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {/* Header với nút đóng */}
        <div className="flex items-center justify-between p-4 border-b border-gold/20">
          <h2 className="font-display text-sm font-bold text-cream uppercase tracking-wider">
            Menu Chính
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gold/25 text-cream hover:bg-gold/10 hover:border-gold/50 transition-all"
            aria-label="Đóng menu"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Danh sách điều hướng */}
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.to;
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => handleNavClick(item.to)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-crimson/40 to-ember/40 border border-gold-deep/60 text-gold-bright shadow-[0_0_14px_rgba(200,16,46,0.25)]"
                    : "border border-gold/25 text-cream hover:bg-gold/10 hover:border-gold/50 hover:translate-x-0.5"
                }`}
              >
                <span className="text-lg" aria-hidden>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Nút đăng xuất ở đáy */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gold/20">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-crimson/40 text-crimson font-semibold uppercase tracking-wider text-sm hover:bg-crimson/10 hover:border-crimson/60 transition-all"
          >
            <span>🚪</span>
            Đăng Xuất
          </button>
        </div>
      </aside>
    </>
  );
}