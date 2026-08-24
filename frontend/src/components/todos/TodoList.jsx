import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onDelete, onSaveTitle }) {
  if (!todos.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#F0C040]/30 bg-[#0a160d]/30 px-4 py-10 text-center text-sm text-[#F4E9CE]/60">
        Chưa có nhiệm vụ nào. Thêm nhiệm vụ ở trên để bắt đầu.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onSaveTitle={onSaveTitle}
        />
      ))}
    </div>
  );
}
