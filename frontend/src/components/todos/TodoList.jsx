import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onDelete, onSaveTitle }) {
  if (!todos.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        No todos yet. Add one above to get started.
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
