import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LevelCard from '../components/reusable/LevelCard';
import { fetchAllLevels } from '../services/levelService';

function getErrorMessage(error) {
  if (error?.status === 400) {
    return error.data?.message || 'Validation failed.';
  }

  if (error?.status === 401) {
    return 'Your session expired. Please log in again.';
  }

  if (error?.status === 403) {
    return error.data?.message || 'You do not have permission to access levels.';
  }

  if (error?.status === 500) {
    return error.message || 'Server error. Please try again later.';
  }

  return error?.message || 'There was a problem with your request.';
}

export default function LevelSelect({ user, onLogout }) {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        navigate('/login');
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
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleLevelSelect = (levelId) => {
    navigate(`/play/${levelId}`);
  };

  // Find the first unlocked level with no stars to mark as "New"
  const firstUnlockedWithoutStars = levels.find(
    (level) => level.isUnlocked && level.starsEarned === 0
  );

  // Calculate win status for scoreboard
  const wonLevels = levels.filter((l) => l.starsEarned > 0).length;
  const totalLevels = levels.length;

  return (
    <div className="min-h-screen bg-[#131313] px-4 py-7 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_60%_at_50%_0%,_#4a1310_0%,_transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#131313] via-[#1E1B1B] to-[#2a0705]" />
      </div>

      {/* Stadium silhouette effect */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none opacity-70" />

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Header with crest and title */}
        <div className="flex flex-col items-center mb-4">
          {/* MUFC Crest SVG */}
          <svg className="w-20 h-22 mb-2 drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]" viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 2 L92 16 L92 52 C92 82 74 100 50 110 C26 100 8 82 8 52 L8 16 Z" fill="#DA291C" stroke="#F0C040" strokeWidth="3" />
            <path d="M50 8 L86 20 L86 52 C86 78 70 94 50 103 C30 94 14 78 14 52 L14 20 Z" fill="#131313" />
            {/* Devil pitchfork silhouette */}
            <g fill="#F0C040">
              <path d="M50 26 c-3 0 -5 2 -5 5 c0 2 1 3.5 2.5 4.5 L46 44 h8 l-1.5 -8.5 C54 34.5 55 33 55 31 c0 -3 -2 -5 -5 -5 z" />
              <path d="M42 46 h16 l-2 34 c0 4 -3 8 -6 8 s-6 -4 -6 -8 z" />
              <path d="M36 30 l4 8 M64 30 l-4 8" stroke="#F0C040" strokeWidth="3" strokeLinecap="round" />
            </g>
            <path d="M20 78 Q50 92 80 78" stroke="#F0C040" strokeWidth="2" fill="none" opacity="0.8" />
          </svg>

          <h1 className="text-3xl font-bold text-[#F4E9CE] tracking-wider uppercase">
            Old Trafford <span className="text-[#F0C040]">Campaign</span>
          </h1>
          <p className="text-xs tracking-[0.3em] text-[#F4E9CE]/60 uppercase mt-1">
            Chọn trận đấu
          </p>
        </div>

        {/* Scoreboard strip */}
        <div className="flex items-center gap-2 bg-gradient-to-b from-[#241f1f] to-[#141010] border border-[#F0C040]/35 rounded-full px-4 py-2 mb-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5),0_4px_10px_rgba(0,0,0,0.4)]">
          <div className="w-2 h-2 rounded-full bg-[#F0C040] shadow-[0_0_8px_#F0C040]" />
          <span className="text-xs tracking-wider text-[#F4E9CE] uppercase">
            Đội hình sẵn sàng · <span className="text-[#F0C040] font-bold">{wonLevels} / {totalLevels}</span> trận đã thắng
          </span>
        </div>

        {/* Error message */}
        {error ? (
          <div className="mb-4 rounded-md border border-red-400/30 bg-red-900/30 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {/* Pitch panel with level grid */}
        <div className="relative bg-gradient-to-b from-[rgba(28,59,39,0.55)] to-[rgba(20,40,27,0.75)] border-2 border-[#F0C040]/25 rounded-3xl p-4 shadow-[0_14px_30px_rgba(0,0,0,0.5),inset_0_0_40px_rgba(0,0,0,0.35)]">
          {/* Pitch line pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 40px, rgba(0,0,0,0.02) 40px 80px)'
          }} />

          {loading ? (
            <div className="relative z-10 text-center py-12 text-[#F4E9CE]/70 text-sm">
              Đang tải trận đấu...
            </div>
          ) : levels.length === 0 ? (
            <div className="relative z-10 text-center py-12 text-[#F4E9CE]/70 text-sm">
              Không có trận đấu nào.
            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {levels.map((level) => (
                <LevelCard
                  key={level.id}
                  order={level.order}
                  tenseName={level.tenseName}
                  isUnlocked={level.isUnlocked}
                  starsEarned={level.starsEarned}
                  isNew={firstUnlockedWithoutStars?.id === level.id}
                  onSelect={() => handleLevelSelect(level.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Field line */}
        <div className="w-full h-1 mt-4 bg-gradient-to-r from-transparent via-[#F4E9CE]/55 to-transparent rounded opacity-55" />

        {/* Footer with buttons and mascot */}
        <div className="flex items-end justify-between mt-4 px-2">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ffe08a] via-[#F0C040] to-[#B8892B] border-[3px] border-[#131313] flex items-center justify-center shadow-[0_6px_0_#7a5b1c,0_10px_16px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_#7a5b1c] transition-transform"
          >
            <svg className="w-6 h-6 text-[#131313]" viewBox="0 0 24 24" fill="none">
              <path d="M15 5 L8 12 L15 19" stroke="#131313" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Red devil mascot */}
          <svg className="h-36" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="150" rx="34" ry="8" fill="black" opacity="0.35" />
            <path d="M60 30 C40 30 26 46 26 66 C26 92 40 112 60 118 C80 112 94 92 94 66 C94 46 80 30 60 30 Z" fill="#DA291C" stroke="#8C0F0A" strokeWidth="3" />
            <path d="M40 34 L30 12 L48 24 Z" fill="#DA291C" stroke="#8C0F0A" strokeWidth="3" />
            <path d="M80 34 L90 12 L72 24 Z" fill="#DA291C" stroke="#8C0F0A" strokeWidth="3" />
            <circle cx="48" cy="64" r="6" fill="#131313" />
            <circle cx="72" cy="64" r="6" fill="#131313" />
            <path d="M46 84 Q60 96 74 84" stroke="#131313" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M60 118 L60 140" stroke="#8C0F0A" strokeWidth="10" strokeLinecap="round" />
          </svg>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-b from-[#241f1f] to-[#141010] border border-[#F0C040]/35 text-[#F4E9CE] text-xs tracking-wider uppercase hover:bg-[#2a2525] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-6" />
    </div>
  );
}