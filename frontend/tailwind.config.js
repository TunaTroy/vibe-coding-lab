/** @type {import('tailwindcss').Config} */
// Tailwind v3 — token màu MU (đỏ Quỷ + vàng gold) từng hardcode inline
// trong code gốc nay tập trung tại đây. Mọi class như text-cream,
// bg-pitch, border-gold/25, from-crimson/40... giữ nguyên như bản cũ.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#120c0c",
        coal: "#1a1a1a",
        pitch: "#131313",
        cream: "#F4E9CE",
        gold: "#F0C040",
        "gold-bright": "#FFD700",
        "gold-deep": "#DAA520",
        "gold-dark": "#8b6914",
        crimson: "#C8102E",
        ember: "#D12621",
        shield: "#DA291C",
      },
      fontFamily: {
        // Dự án gốc dùng Inter cho toàn bộ (kể cả heading uppercase tracking)
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
