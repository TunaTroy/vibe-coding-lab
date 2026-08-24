import React from 'react';

function ResultModal({ isOpen, onClose, onBackToHome, result }) {
  if (!isOpen) return null;

  const starSVG = (filled) => (
    <svg
      className={`w-8 h-8 ${filled ? 'text-[#FFD700]' : 'text-[#F4E9CE]/20'}`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2 L14.8 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.2 8.6 Z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border-2 border-[#F0C040]/40 p-6 max-w-md w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(240,192,64,0.1)]">
        {/* MUFC-style header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-2">
            <svg className="w-12 h-14 mx-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 2 L92 16 L92 52 C92 82 74 100 50 110 C26 100 8 82 8 52 L8 16 Z" fill="#DA291C" stroke="#F0C040" strokeWidth="3" />
              <path d="M50 8 L86 20 L86 52 C86 78 70 94 50 103 C30 94 14 78 14 52 L14 20 Z" fill="#131313" />
              <g fill="#F0C040">
                <path d="M50 26 c-3 0 -5 2 -5 5 c0 2 1 3.5 2.5 4.5 L46 44 h8 l-1.5 -8.5 C54 34.5 55 33 55 31 c0 -3 -2 -5 -5 -5 z" />
                <path d="M42 46 h16 l-2 34 c0 4 -3 8 -6 8 s-6 -4 -6 -8 z" />
                <path d="M36 30 l4 8 M64 30 l-4 8" stroke="#F0C040" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#F4E9CE] uppercase tracking-wider">Kết Quả</h2>
        </div>

        <div className="space-y-6">
          {/* Score */}
          <div className="bg-gradient-to-r from-[#C8102E]/20 to-[#D12621]/20 rounded-xl p-4 border border-[#C8102E]/30">
            <div className="flex justify-between items-center">
              <span className="text-[#F4E9CE]/80 font-semibold uppercase tracking-wider text-sm">Điểm số:</span>
              <span className="text-4xl font-bold text-[#FFD700]">{result.score}%</span>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-between items-center">
            <span className="text-[#F4E9CE]/80 font-semibold uppercase tracking-wider text-sm">Số sao:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((star) => starSVG(star <= result.stars))}
            </div>
          </div>

          {/* Coin Award */}
          {result.coinAwarded > 0 && (
            <div className="bg-gradient-to-r from-[#DAA520]/20 to-[#FFD700]/20 rounded-xl p-4 border border-[#DAA520]/40">
              <p className="text-[#FFD700] font-bold text-center text-lg">
                +{result.coinAwarded} ĐÔ LA ĐẠT
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-[#131313] py-3 px-4 rounded-xl font-bold uppercase tracking-wider hover:from-[#B8860B] hover:to-[#DAA520] transition-all shadow-[0_4px_0_#8B6914,0_6px_12px_rgba(0,0,0,0.3)]"
          >
            Chơi Lại
          </button>
          <button
            onClick={onBackToHome}
            className="flex-1 bg-gradient-to-b from-[#241f1f] to-[#141010] border border-[#F0C040]/40 text-[#F4E9CE] py-3 px-4 rounded-xl font-bold uppercase tracking-wider hover:bg-[#2a2525] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
