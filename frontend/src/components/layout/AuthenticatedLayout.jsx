import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import SidebarNav from "./SidebarNav";
import TopBar from "./TopBar";

export default function AuthenticatedLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) closeMenu();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [closeMenu]);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen">
      <div className="arena-bg" aria-hidden />
      <div className="arena-glow" aria-hidden />
      <div className="arena-noise" aria-hidden />
      <div className="relative z-10 min-h-screen xl:grid xl:grid-cols-[256px_minmax(0,1fr)]">
        <SidebarNav isOpen={isMenuOpen} onClose={closeMenu} onLogout={handleLogout} />
        <div className="min-w-0">
          <TopBar onMenuToggle={() => setIsMenuOpen(true)} isMenuOpen={isMenuOpen} />
          <main className="mx-auto w-full min-w-0 max-w-[1500px] px-4 pb-10 pt-5 sm:px-6 xl:px-9 xl:pt-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
