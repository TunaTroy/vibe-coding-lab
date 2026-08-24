export default function LevelCard({ order, tenseName, isUnlocked, starsEarned, isNew, onSelect }) {
  const starSVG = (filled) => (
    <svg
      className={`w-3 h-3 ${filled ? 'text-yellow-400' : 'text-white/20'}`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2 L14.8 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.2 8.6 Z" />
    </svg>
  );

  const lockIcon = (
    <svg className="w-5 h-5 text-yellow-400/90" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="#F0C040" opacity="0.9" />
      <path
        d="M8 11 V8 a4 4 0 0 1 8 0 v3"
        stroke="#F0C040"
        strokeWidth="2.4"
        fill="none"
      />
    </svg>
  );

  const truncatedTenseName = tenseName.length > 12 ? tenseName.substring(0, 10) + '...' : tenseName;

  return (
    <div
      onClick={isUnlocked ? onSelect : undefined}
      className={`
        relative aspect-[3/3.6] rounded-2xl border-2 transition-all duration-150
        flex flex-col items-center justify-center p-2
        ${isUnlocked
          ? 'bg-gradient-to-br from-[#FF4E3F] via-[#DA291C] to-[#8C0F0A] border-[#F0C040] hover:scale-105 hover:shadow-xl cursor-pointer shadow-[0_6px_0_#8C0F0A,0_10px_16px_rgba(0,0,0,0.45)]'
          : 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500 cursor-not-allowed opacity-60 grayscale'
        }
      `}
    >
      {/* V-neck collar accent */}
      {isUnlocked && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[46%] h-4 bg-[#131313] opacity-85"
          style={{
            clipPath: 'polygon(15% 0, 85% 0, 65% 100%, 35% 100%)',
          }}
        />
      )}

      {/* Level number */}
      <div className={`text-2xl font-bold ${isUnlocked ? 'text-[#F4E9CE]' : 'text-gray-400'} mt-2`}>
        {isUnlocked ? order : ''}
      </div>

      {/* Stars or lock icon */}
      <div className="flex gap-0.5 mt-1">
        {isUnlocked ? (
          <>
            {starSVG(starsEarned >= 1)}
            {starSVG(starsEarned >= 2)}
            {starSVG(starsEarned >= 3)}
          </>
        ) : (
          lockIcon
        )}
      </div>

      {/* Tense name */}
      <div className={`text-[10px] mt-1 text-center ${isUnlocked ? 'text-[#F4E9CE]/90' : 'text-gray-400'}`}>
        {truncatedTenseName}
      </div>

      {/* "Mới" badge */}
      {isNew && (
        <div className="absolute -top-1.5 -right-1.5 bg-[#F0C040] text-[#131313] text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
          Mới
        </div>
      )}
    </div>
  );
}