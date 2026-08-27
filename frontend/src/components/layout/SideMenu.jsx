import { NavLink } from "react-router-dom";

import Card from "../ui/Card";

/* ============================================================
   SideMenu — refactor từ components/sidebar/Menu.jsx +
   khối nav/daily-task inline trong HomePage.jsx (trùng lặp).
   ============================================================ */

const NAV_ITEMS = [
  { to: "/home", label: "Trang Chủ", icon: "🏠", end: true },
  { to: "/levels", label: "Chương Trình Học", icon: "📚", end: false },
  { to: "/todos", label: "Ghi Chú HLV", icon: "📝", end: false },
];

const LOCKED_ITEMS = [
  { label: "Chế Độ Chiến Tranh", icon: "⚔️" },
  { label: "Cửa Hàng Vật Phẩm", icon: "🛒" },
  { label: "Trang Cá Nhân", icon: "👤" },
];

export default function SideMenu({ tasks }) {
  return (
    <Card className="p-4">
      <nav className="space-y-2" aria-label="Menu chính">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-crimson/40 to-ember/40 border border-gold-deep/60 text-gold-bright shadow-[0_0_14px_rgba(200,16,46,0.25)]"
                  : "border border-gold/25 text-cream hover:bg-gold/10 hover:border-gold/50 hover:translate-x-0.5"
              }`
            }
          >
            <span className="text-lg" aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {LOCKED_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled
            title="Sắp ra mắt"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gold/20 text-cream/50 font-semibold uppercase tracking-wider text-sm opacity-60 cursor-not-allowed"
          >
            <span className="text-lg grayscale" aria-hidden>{item.icon}</span>
            {item.label}
            <span className="ml-auto text-[10px] font-mono text-gold/50">SOON</span>
          </button>
        ))}
      </nav>

      {/* Nhiệm vụ hàng ngày */}
      <div className="mt-6 pt-5 border-t border-gold/15">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep mb-3">
          Nhiệm Vụ Hàng Ngày
        </h3>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-pitch/40 border border-gold/15"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  task.done ? "bg-gold-bright shadow-[0_0_8px_rgba(255,215,0,0.7)]" : "bg-cream/30"
                }`}
              />
              <span className={`text-xs ${task.done ? "text-cream/85" : "text-cream/55"}`}>{task.label}</span>
              {task.done && <span className="ml-auto text-[10px] font-mono text-gold-deep">+20💰</span>}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
