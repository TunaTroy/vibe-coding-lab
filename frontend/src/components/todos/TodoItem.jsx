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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F0C040]/30 bg-gradient-to-r from-[#C8102E]/20 to-[#D12621]/20 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(todo.done)}
          onChange={() => onToggle(todo.id, !todo.done)}
          className="h-4 w-4 rounded border-[#F0C040]/50 text-[#DAA520] focus:ring-[#F0C040]/50 bg-[#1a1a1a]"
          aria-label={`Toggle todo ${todo.title}`}
        />

        {isEditing ? (
          <div className="flex w-full items-center gap-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề nhiệm vụ" />
            <Button size="sm" onClick={handleSave}>Lưu</Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>Hủy</Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`text-left text-sm font-medium ${todo.done ? 'text-[#F4E9CE]/40 line-through' : 'text-[#F4E9CE]'}`}
          >
            {todo.title}
          </button>
        )}
      </div>

      <Button variant="danger" size="sm" onClick={() => onDelete(todo.id)}>
        Xóa
      </Button>
    </div>
  );
}
