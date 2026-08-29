import { useRef, useState } from "react";

/* ============================================================
   FILL_BLANK — payload: { sentence: string, hint?: string }
   answer gửi lên: string — BẮT BUỘC .trim().toLowerCase() trước
   khi gửi (correctAnswer trong DB luôn lưu dạng thường).
   Commit khi blur hoặc nhấn Enter; rỗng (sau trim) thì KHÔNG
   commit — user vẫn gõ tiếp được hoặc bỏ qua (tự tính sai như
   MC chưa chọn).
   ============================================================ */

export default function FillBlankQuestion({ question, selected, locked, onSelect }) {
  const [text, setText] = useState(typeof selected === "string" ? selected : "");
  const inputRef = useRef(null);

  const sentence = question.payload?.sentence ?? "";
  const hint = question.payload?.hint;
  const parts = sentence.split("___");

  const commit = () => {
    if (locked) return;
    const normalized = text.trim().toLowerCase();
    if (normalized.length > 0) onSelect(normalized);
  };

  return (
    <div className="anim-rise">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-cream leading-snug">
        {question.prompt}
      </h2>

      {/* Câu với chỗ trống — hiển thị live chữ đang gõ */}
      <p className="mt-5 text-lg sm:text-xl font-semibold leading-relaxed text-cream">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-block min-w-[76px] border-b-2 border-gold-deep px-2 text-center text-gold-bright">
                {text.trim() || "…"}
              </span>
            )}
          </span>
        ))}
      </p>

      <div className="mt-6 max-w-sm">
        <label
          htmlFor={`fill-${question.id}`}
          className="block text-xs font-bold uppercase tracking-wider text-gold mb-1.5"
        >
          Câu trả lời của bạn
        </label>
        <input
          id={`fill-${question.id}`}
          ref={inputRef}
          type="text"
          value={text}
          disabled={locked}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") inputRef.current?.blur();
          }}
          placeholder="Gõ từ cần điền..."
          autoComplete="off"
          className="w-full rounded-xl border-2 border-gold/25 bg-pitch/50 px-4 py-3 text-cream font-semibold
            placeholder:text-cream/30 outline-none transition-all duration-200
            focus:border-gold/70 focus:bg-gold/10 disabled:opacity-60"
        />
        {hint && <p className="mt-2 font-mono text-xs text-gold-deep">💡 Gợi ý: {hint}</p>}
      </div>
    </div>
  );
}
