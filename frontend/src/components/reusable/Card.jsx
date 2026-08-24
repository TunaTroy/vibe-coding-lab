export default function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-[#F0C040]/30 bg-gradient-to-b from-[#0a160d]/90 to-[#0e1f13]/90 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(240,192,64,0.1)] ${className}`}>{children}</div>;
}
