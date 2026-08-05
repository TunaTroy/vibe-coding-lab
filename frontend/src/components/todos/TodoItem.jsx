import { useState } from 'react';
import Button from '../reusable/Button';
import Input from '../reusable/Input';

export default function TodoItem({ todo, onToggle, onDelete, onSaveTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    await onSaveTitle(todo.id, trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(todo.done)}
          onChange={() => onToggle(todo.id, !todo.done)}
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
          aria-label={`Toggle todo ${todo.title}`}
        />

        {isEditing ? (
          <div className="flex w-full items-center gap-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Todo title" />
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>Cancel</Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`text-left text-sm font-medium ${todo.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}
          >
            {todo.title}
          </button>
        )}
      </div>

      <Button variant="danger" size="sm" onClick={() => onDelete(todo.id)}>
        Delete
      </Button>
    </div>
  );
}
