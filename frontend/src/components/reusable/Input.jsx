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
  return (
    <label className="block w-full">
      {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-md border px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-300 focus:ring-sky-200'
        }`}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
