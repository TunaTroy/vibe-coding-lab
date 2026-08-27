import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import TodoList from "../components/todos/TodoList";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Reveal from "../components/ui/Reveal";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import * as todoService from "../services/todoService";

/* ============================================================
   TodoPage — trang demo Todo JWT (bản gốc tồn tại nhưng KHÔNG
   được wire vào router — refactor này thêm route /todos).
   ============================================================ */

export default function TodoPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    todoService
      .fetchTodos()
      .then((res) => mounted && setTodos(res.todos))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (!user) return null;

  const remaining = todos.filter((t) => !t.completed).length;

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await todoService.createTodo(title);
      setTitle("");
      const res = await todoService.fetchTodos();
      setTodos(res.todos);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleToggle = async (id) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;
    try {
      // PUT /todos/:id với { done } — backend updateTodoSchema nhận title?/done?
      await todoService.toggleTodo(id, !current.completed);
      const res = await todoService.fetchTodos();
      setTodos(res.todos);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await todoService.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <PageShell user={user} onLogout={handleLogout} active="todos">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-deep">
              Demo · Fullstack Todo JWT
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold uppercase tracking-wide text-cream">
              Ghi Chú <span className="text-gold-bright">HLV</span>
            </h2>
            <p className="mt-1.5 text-sm text-cream/60">
              Lên kế hoạch luyện tập như một huấn luyện viên thực thụ.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <Card className="p-6 border-2 border-gold/25">
            {error && (
              <div role="alert" className="anim-shake mb-4 rounded-xl border border-crimson/50 bg-crimson/15 px-4 py-2.5 text-sm text-[#ff9d92]">
                {error}
              </div>
            )}

            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  label="Công việc mới"
                  placeholder="Ví dụ: Học 5 từ vựng về sân vận động..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="sm:self-end sm:mt-0">
                Thêm +
              </Button>
            </form>

            <div className="mt-6">
              {loading ? (
                <p className="py-10 text-center font-mono text-sm text-cream/50">Đang tải ghi chú...</p>
              ) : (
                <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
              )}
            </div>

            {!loading && todos.length > 0 && (
              <p className="mt-4 pt-4 border-t border-gold/15 font-mono text-xs text-cream/50">
                {remaining} việc cần làm · {todos.length - remaining} đã hoàn thành 🏆
              </p>
            )}
          </Card>
        </Reveal>
      </div>
    </PageShell>
  );
}
