import { useState } from 'react';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  onChange,
  error,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <label className="block w-full">
      {label ? <span className="mb-1.5 block text-sm font-bold uppercase tracking-wider text-[#F4E9CE]">{label}</span> : null}
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border px-4 py-3 pr-10 text-sm text-[#F4E9CE] placeholder:text-[#F4E9CE]/40 bg-[#1a1a1a]/80 focus:outline-none focus:ring-2 focus:ring-[#F0C040]/50 ${
            error ? 'border-[#C8102E] focus:ring-[#C8102E]/30' : 'border-[#F0C040]/30 focus:border-[#F0C040]'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F0C040]/60 hover:text-[#F0C040] focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              // Eye closed icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              // Eye open icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error ? <span className="mt-1 block text-xs text-[#C8102E] font-semibold">{error}</span> : null}
    </label>
  );
}
