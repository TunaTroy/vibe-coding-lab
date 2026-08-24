export default function StarRating({ earned, total = 3 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, index) => (
        <svg
          key={index}
          className={`w-4 h-4 ${index < earned ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2 L14.8 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.2 8.6 Z" />
        </svg>
      ))}
    </div>
  );
}