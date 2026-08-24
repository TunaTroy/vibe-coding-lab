
import { Link, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
  { 
    id: 'home', 
    label: 'Trang Chủ', 
    path: '/home', 
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    )
  },
  { 
    id: 'levels', 
    label: 'Chương Trình Học', 
    path: '/levels',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    id: 'battle', 
    label: 'Chế Độ Chiến Tranh', 
    path: '/battle',
    disabled: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    id: 'shop', 
    label: 'Cửa Hàng Vật Phẩm', 
    path: '/shop',
    disabled: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    id: 'profile', 
    label: 'Trang Cá Nhân', 
    path: '/profile',
    disabled: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
];

const DAILY_TASKS = [
  { id: 1, text: 'Hoàn thành 1 bài học', completed: true },
  { id: 2, text: 'Đăng nhập 3 ngày liên tiếp', completed: false },
  { id: 3, text: 'Thu thập 50 Đô la Đạt', completed: false },
];

export default function Menu() {
  const location = useLocation();

  return (
    <Card className="p-4 space-y-4">
      {/* Main Navigation */}
      <nav className="space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.disabled) {
            return (
              <button
                key={item.id}
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a1a1a]/30 border border-[#F0C040]/10 text-[#F4E9CE]/50 font-semibold uppercase tracking-wider text-sm cursor-not-allowed transition-all"
              >
                {item.icon}
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#C8102E] to-[#8B0000] border border-[#DAA520]/50 text-[#FFD700] shadow-[0_2px_8px_rgba(200,16,46,0.4)]'
                  : 'bg-[#1a1a1a]/50 border border-[#F0C040]/20 text-[#F4E9CE] hover:bg-[#F0C040]/10 hover:border-[#F0C040]/40'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Daily Tasks */}
      <div className="pt-4 border-t border-[#F0C040]/20">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#DAA520] mb-3">
          Nhiệm Vụ Hàng Ngày
        </h3>
        <div className="space-y-2">
          {DAILY_TASKS.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                task.completed
                  ? 'bg-[#1a1a1a]/50 border-[#F0C040]/20'
                  : 'bg-[#1a1a1a]/30 border-[#F0C040]/10'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  task.completed
                    ? 'bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]'
                    : 'bg-[#F4E9CE]/30'
                }`}
              />
              <span
                className={`text-xs ${
                  task.completed ? 'text-[#F4E9CE]/90' : 'text-[#F4E9CE]/50'
                }`}
              >
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}