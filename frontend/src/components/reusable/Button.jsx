export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-[#131313] hover:from-[#B8860B] hover:to-[#DAA520] disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-400 shadow-[0_4px_0_#8B6914,0_6px_12px_rgba(0,0,0,0.3)]',
    secondary: 'bg-gradient-to-b from-[#241f1f] to-[#141010] border border-[#F0C040]/40 text-[#F4E9CE] hover:bg-[#2a2525] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
    danger: 'bg-gradient-to-r from-[#C8102E] to-[#D12621] text-white hover:from-[#A00D24] hover:to-[#B01E1C] disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 shadow-[0_4px_0_#8B0000,0_6px_12px_rgba(0,0,0,0.3)]',
    ghost: 'bg-transparent border border-[#F0C040]/30 text-[#F4E9CE] hover:bg-[#F0C040]/10 disabled:text-gray-500 disabled:border-gray-600',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F0C040]/50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
