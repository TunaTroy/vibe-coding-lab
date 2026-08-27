import { useEffect, useRef, useState } from "react";

/* ============================================================
   Reveal — hiệu ứng xuất hiện khi cuộn (tôn trọng
   prefers-reduced-motion qua CSS trong src/index.css).
   ============================================================ */

export default function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ "--rv-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}
