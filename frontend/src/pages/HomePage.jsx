import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/reusable/Button";
import Card from "../components/reusable/Card";
import { fetchAllLevels } from "../services/levelService";

function getErrorMessage(error) {
  if (error?.status === 400) {
    return (
      error.errors?.title?.[0] || error.data?.message || "Validation failed."
    );
  }

  if (error?.status === 401) {
    return "Your session expired. Please log in again.";
  }

  if (error?.status === 403) {
    return "You do not have permission to update this todo.";
  }

  if (error?.status === 500) {
    return error.message || "Server error. Please try again later.";
  }

  return error?.message || "There was a problem with your request.";
}

export default function HomePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock user stats (will be replaced with real API when available)
  const userStats = {
    name: user?.email?.split("@")[0] || "Học Viên",
    level: 5,
    rank: "Chiến Binh",
    coins: user?.coinBalance || 1250,
    stars: 12,
  };

  // Mock ranking data
  const rankingData = [
    {
      rank: 1,
      name: "UnitedKing99",
      stars: 45,
      coins: 3200,
      isCurrentUser: false,
    },
    {
      rank: 2,
      name: "RedDevilFan",
      stars: 42,
      coins: 2950,
      isCurrentUser: false,
    },
    {
      rank: 3,
      name: "OldTrafford",
      stars: 38,
      coins: 2700,
      isCurrentUser: false,
    },
    {
      rank: 4,
      name: "MUFC Forever",
      stars: 35,
      coins: 2450,
      isCurrentUser: false,
    },
    {
      rank: 5,
      name: user?.email?.split("@")[0] || "Học Viên",
      stars: userStats.stars,
      coins: userStats.coins,
      isCurrentUser: true,
    },
  ];

  // Event status (weekend event)
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const eventStatus = isWeekend
    ? {
        status: "active",
        message: "🔥 Đang diễn ra - Kết thúc vào Chủ Nhật 23:59!",
      }
    : {
        status: "locked",
        message: "🔒 Đang khóa - Mở cửa vào Thứ 7 & Chủ Nhật",
      };

  const loadLevels = async () => {
    setLoading(true);
    try {
      const response = await fetchAllLevels();
      setLevels(response.levels || []);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);

      if (err?.status === 401) {
        onLogout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, []);

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  const handleStartLearning = () => {
    navigate("/levels");
  };

  const handleChapterSelect = (chapterIndex) => {
    if (chapterIndex === 0) {
      navigate("/levels");
    }
    // Future chapters will navigate to their respective level selectors
  };

  return (
    <div className="min-h-screen bg-[#120c0c] px-4 py-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#120c0c] via-[#1a1a1a] to-[#2a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,_#4a1510_0%,_transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 mb-6 bg-gradient-to-r from-[#241f1f] to-[#141010] border border-[#F0C040]/30 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <svg
              className="w-12 h-14 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
              viewBox="0 0 100 112"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 2 L92 16 L92 52 C92 82 74 100 50 110 C26 100 8 82 8 52 L8 16 Z"
                fill="#DA291C"
                stroke="#F0C040"
                strokeWidth="3"
              />
              <path
                d="M50 8 L86 20 L86 52 C86 78 70 94 50 103 C30 94 14 78 14 52 L14 20 Z"
                fill="#131313"
              />
              <g fill="#F0C040">
                <path d="M50 26 c-3 0 -5 2 -5 5 c0 2 1 3.5 2.5 4.5 L46 44 h8 l-1.5 -8.5 C54 34.5 55 33 55 31 c0 -3 -2 -5 -5 -5 z" />
                <path d="M42 46 h16 l-2 34 c0 4 -3 8 -6 8 s-6 -4 -6 -8 z" />
                <path
                  d="M36 30 l4 8 M64 30 l-4 8"
                  stroke="#F0C040"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-[#F4E9CE] uppercase tracking-wider leading-tight">
                Old Trafford <span className="text-[#FFD700]">Academy</span>
              </h1>
              <p className="text-xs text-[#F4E9CE]/60 uppercase tracking-wider">
                Vibe English Lab
              </p>
            </div>
          </div>

          {/* User Stats Bar */}
          <div className="flex items-center gap-6 bg-[#0a160d]/50 rounded-xl px-4 py-2 border border-[#F0C040]/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DAA520] to-[#FFD700] flex items-center justify-center text-[#131313] font-bold text-sm">
                {userStats.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[#F4E9CE]">
                  {userStats.name}
                </p>
                <p className="text-xs text-[#DAA520]">
                  Lv. {userStats.level} - {userStats.rank}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-[#F0C040]/30" />

            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <div>
                <p className="text-sm font-bold text-[#FFD700]">
                  {userStats.coins.toLocaleString()}
                </p>
                <p className="text-xs text-[#F4E9CE]/60">Đô la Đạt</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR */}
          <aside className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#C8102E]/30 to-[#D12621]/30 border border-[#DAA520]/50 text-[#FFD700] font-bold uppercase tracking-wider text-sm"
                >
                  <span className="text-lg">🏠</span>
                  Trang Chủ
                </a>
                <button
                  onClick={handleStartLearning}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#F0C040]/30 text-[#F4E9CE] font-semibold uppercase tracking-wider text-sm hover:bg-[#F0C040]/10 hover:border-[#F0C040]/50 transition-all"
                >
                  <span className="text-lg">📚</span>
                  Chương Trình Học
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#F0C040]/30 text-[#F4E9CE]/60 font-semibold uppercase tracking-wider text-sm hover:bg-[#F0C040]/10 hover:border-[#F0C040]/50 transition-all cursor-not-allowed opacity-60">
                  <span className="text-lg">⚔️</span>
                  Chế Độ Chiến Tranh
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#F0C040]/30 text-[#F4E9CE]/60 font-semibold uppercase tracking-wider text-sm hover:bg-[#F0C040]/10 hover:border-[#F0C040]/50 transition-all cursor-not-allowed opacity-60">
                  <span className="text-lg">🛒</span>
                  Cửa Hàng Vật Phẩm
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#F0C040]/30 text-[#F4E9CE]/60 font-semibold uppercase tracking-wider text-sm hover:bg-[#F0C040]/10 hover:border-[#F0C040]/50 transition-all cursor-not-allowed opacity-60">
                  <span className="text-lg">👤</span>
                  Trang Cá Nhân
                </button>
              </nav>

              {/* Daily Tasks Widget */}
              <div className="mt-6 pt-6 border-t border-[#F0C040]/20">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#DAA520] mb-3">
                  Nhiệm Vụ Hàng Ngày
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a]/50 border border-[#F0C040]/20">
                    <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                    <span className="text-xs text-[#F4E9CE]/80">
                      Hoàn thành 1 bài học
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a]/50 border border-[#F0C040]/20">
                    <div className="w-2 h-2 rounded-full bg-[#F4E9CE]/40" />
                    <span className="text-xs text-[#F4E9CE]/60">
                      Đăng nhập 3 ngày liên tiếp
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a]/50 border border-[#F0C040]/20">
                    <div className="w-2 h-2 rounded-full bg-[#F4E9CE]/40" />
                    <span className="text-xs text-[#F4E9CE]/60">
                      Thu thập 50 Đô la Đạt
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-2 space-y-6">
            {/* Learning Mode Card */}
            <Card className="p-6 border-2 border-[#DAA520]/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#DAA520]/20 to-transparent pointer-events-none" />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#FFD700] uppercase tracking-wider mb-1">
                    📚 Chế Độ Học
                  </h2>
                  <p className="text-sm text-[#F4E9CE]/80">R luyện Tiếng Anh</p>
                </div>
                <div className="text-4xl">🎯</div>
              </div>

              <p className="text-[#F4E9CE]/70 mb-6">
                Thử thách 3 chương ngữ pháp cốt lõi
              </p>

              {/* Chapter List */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleChapterSelect(0)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#C8102E]/40 to-[#D12621]/40 border border-[#DAA520]/50 hover:border-[#FFD700] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#131313] font-bold">
                      1
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#F4E9CE] group-hover:text-[#FFD700] transition-colors">
                        12 Thì Tiếng Anh
                      </p>
                      <p className="text-xs text-[#F4E9CE]/60">
                        {levels.length} levels • Sẵn sàng
                      </p>
                    </div>
                  </div>
                  <span className="text-[#FFD700] text-xl">→</span>
                </button>

                <button
                  disabled
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1a1a1a]/50 border border-[#F0C040]/20 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F4E9CE]/20 flex items-center justify-center text-[#F4E9CE]/60 font-bold">
                      2
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#F4E9CE]/60">Câu Bị Động</p>
                      <p className="text-xs text-[#F4E9CE]/40">Coming Soon</p>
                    </div>
                  </div>
                  <span className="text-[#F0C040]/40 text-xl">🔒</span>
                </button>

                <button
                  disabled
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1a1a1a]/50 border border-[#F0C040]/20 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F4E9CE]/20 flex items-center justify-center text-[#F4E9CE]/60 font-bold">
                      3
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#F4E9CE]/60">Câu Ước</p>
                      <p className="text-xs text-[#F4E9CE]/40">Coming Soon</p>
                    </div>
                  </div>
                  <span className="text-[#F0C040]/40 text-xl">🔒</span>
                </button>
              </div>

              <Button
                onClick={handleStartLearning}
                className="w-full bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-[#131313] font-bold uppercase tracking-wider shadow-[0_4px_0_#8B6914,0_6px_12px_rgba(0,0,0,0.3)] hover:from-[#B8860B] hover:to-[#DAA520] transition-all"
              >
                Vào Học Ngay 🚀
              </Button>
            </Card>

            {/* Battle Mode Card */}
            <Card className="p-6 border-2 border-[#C8102E]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C8102E]/20 to-transparent pointer-events-none" />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#C8102E] uppercase tracking-wider mb-1">
                    ⚔️ Chế Độ Chiến Tranh
                  </h2>
                  <p className="text-sm text-[#F4E9CE]/80">
                    Đại Chiến Cuối Tuần
                  </p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>

              <p className="text-[#F4E9CE]/70 mb-4">
                Làm bài tập tích lũy Đô la Đạt & Trang bị cho Nhân vật
              </p>

              {/* Event Status */}
              <div
                className={`p-4 rounded-xl border mb-4 ${
                  eventStatus.status === "active"
                    ? "bg-[#DAA520]/20 border-[#DAA520]/50"
                    : "bg-[#1a1a1a]/50 border-[#F0C040]/30"
                }`}
              >
                <p
                  className={`font-bold text-sm mb-1 ${
                    eventStatus.status === "active"
                      ? "text-[#FFD700]"
                      : "text-[#F4E9CE]/60"
                  }`}
                >
                  {eventStatus.message}
                </p>
                {eventStatus.status === "locked" && (
                  <p className="text-xs text-[#F4E9CE]/40">
                    Mở cửa vào Thứ 7 & Chủ Nhật hàng tuần
                  </p>
                )}
              </div>

              <Button
                disabled={eventStatus.status === "locked"}
                variant={
                  eventStatus.status === "active" ? "primary" : "secondary"
                }
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {eventStatus.status === "active"
                  ? "Tham Gia Chiến Trận ⚔️"
                  : "Xem Chiến Trường & Trang Bị 👁"}
              </Button>
            </Card>
          </main>

          {/* RANKING PANEL */}
          <aside className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#DAA520] mb-4 flex items-center gap-2">
                🏆 Bảng Xếp Hạng Tuần
              </h3>

              <div className="space-y-2">
                {rankingData.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      player.isCurrentUser
                        ? "bg-gradient-to-r from-[#DAA520]/30 to-[#FFD700]/20 border-[#DAA520] shadow-[0_0_12px_rgba(218,165,32,0.2)]"
                        : "bg-[#1a1a1a]/30 border-[#F0C040]/20"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        player.rank <= 3
                          ? "bg-gradient-to-br from-[#DAA520] to-[#FFD700] text-[#131313]"
                          : "bg-[#F4E9CE]/20 text-[#F4E9CE]"
                      }`}
                    >
                      {player.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm truncate ${
                          player.isCurrentUser
                            ? "text-[#FFD700]"
                            : "text-[#F4E9CE]"
                        }`}
                      >
                        {player.name}
                      </p>
                      <p className="text-xs text-[#F4E9CE]/60">
                        ⭐ {player.stars} • 💰 {player.coins}
                      </p>
                    </div>
                    {player.isCurrentUser && (
                      <span className="text-xs text-[#DAA520] font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[#F0C040]/20 text-center">
                <button className="text-xs text-[#F4E9CE]/60 hover:text-[#DAA520] transition-colors">
                  Xem xếp hạng đầy đủ →
                </button>
              </div>
            </Card>
          </aside>
        </div>

        {/* FOOTER ANNOUNCEMENT */}
        <footer className="mt-6">
          <Card className="p-4 border-2 border-[#DAA520]/40 bg-gradient-to-r from-[#DAA520]/10 to-[#FFD700]/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-bold text-[#FFD700] text-sm uppercase tracking-wider">
                    Sự Kiện Cuối Tuần Đang Diễn Ra!
                  </p>
                  <p className="text-xs text-[#F4E9CE]/80">
                    Nhân 2 Đô la Đạt khi hoàn thành Chương 1 • Giới hạn thời
                    gian
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 bg-[#1a1a1a]/50 rounded-lg px-3 py-2 border border-[#F0C040]/30">
                <span className="text-lg">🛒</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#DAA520]">
                    Vật phẩm hot
                  </p>
                  <p className="text-xs text-[#F4E9CE]/60">
                    Giáp Quỷ Đỏ (+10% X2 Coin)
                  </p>
                </div>
                <span className="text-xs text-[#FFD700] font-bold">500 💰</span>
              </div>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  );
}
