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
    primary: 'bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-300',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
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
      className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
