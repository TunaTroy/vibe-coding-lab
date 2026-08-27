/* ============================================================
   TodoList — refactor từ todos/TodoList.jsx + TodoItem.jsx
   (ghép lại vì TodoItem chỉ render bên trong TodoList).
   ============================================================ */

export default function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gold/25 px-6 py-10 text-center">
        <p className="text-3xl" aria-hidden>🗒️</p>
        <p className="mt-2 text-sm text-cream/60">
          Chưa có ghi chú nào. Thêm mục tiêu luyện tập đầu tiên của bạn!
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="group anim-rise flex items-center gap-3 rounded-xl border border-gold/20 bg-pitch/40 px-4 py-3 transition-all duration-200 hover:border-gold/45 hover:bg-pitch/60"
        >
          <button
            type="button"
            onClick={() => onToggle(todo.id)}
            aria-label={todo.completed ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
            className={`w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200
              ${
                todo.completed
                  ? "bg-gradient-to-br from-gold-deep to-gold-bright border-gold-bright"
                  : "border-gold/40 hover:border-gold"
              }`}
          >
            {todo.completed && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7.5 5.5 11 12 3.5" stroke="#131313" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium truncate transition-all duration-200 ${
                todo.completed ? "text-cream/40 line-through" : "text-cream"
              }`}
            >
              {todo.title}
            </p>
            <p className="font-mono text-[10px] text-cream/35">
              {new Date(todo.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            aria-label={`Xóa: ${todo.title}`}
            className="shrink-0 rounded-lg p-2 text-cream/30 opacity-0 transition-all duration-200 hover:bg-crimson/20 hover:text-[#ff9d92] group-hover:opacity-100 focus-visible:opacity-100"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
