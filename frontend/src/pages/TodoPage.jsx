import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/reusable/Button';
import Card from '../components/reusable/Card';
import Input from '../components/reusable/Input';
import TodoList from '../components/todos/TodoList';
import api from '../services/api';

function getErrorMessage(error) {
  if (error?.status === 400) {
    return error.errors?.title?.[0] || error.data?.message || 'Validation failed.';
  }

  if (error?.status === 401) {
    return 'Your session expired. Please log in again.';
  }

  if (error?.status === 403) {
    return 'You do not have permission to update this todo.';
  }

  if (error?.status === 500) {
    return error.message || 'Server error. Please try again later.';
  }

  return error?.message || 'There was a problem with your request.';
}

export default function TodoPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const response = await api.request('/todos');
      setTodos(response.todos || []);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);

      if (err?.status === 401) {
        onLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Title is required.');
      return;
    }

    try {
      setError('');
      await api.request('/todos', {
        method: 'POST',
        body: JSON.stringify({ title: trimmed }),
      });
      setTitle('');
      await loadTodos();
    } catch (err) {
      setError(getErrorMessage(err));
      if (err?.status === 401) {
        onLogout();
        navigate('/login');
      }
    }
  };

  const handleToggle = async (todoId, done) => {
    try {
      setError('');
      await api.request(`/todos/${todoId}`, {
        method: 'PUT',
        body: JSON.stringify({ done }),
      });
      await loadTodos();
    } catch (err) {
      setError(getErrorMessage(err));
      if (err?.status === 401) {
        onLogout();
        navigate('/login');
      }
    }
  };

  const handleSaveTitle = async (todoId, nextTitle) => {
    try {
      setError('');
      await api.request(`/todos/${todoId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: nextTitle }),
      });
      await loadTodos();
    } catch (err) {
      setError(getErrorMessage(err));
      if (err?.status === 401) {
        onLogout();
        navigate('/login');
      }
      throw err;
    }
  };

  const handleDelete = async (todoId) => {
    try {
      setError('');
      await api.request(`/todos/${todoId}`, {
        method: 'DELETE',
      });
      await loadTodos();
    } catch (err) {
      setError(getErrorMessage(err));
      if (err?.status === 401) {
        onLogout();
        navigate('/login');
      }
    }
  };

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  const handleStartQuiz = async () => {
    navigate('/levels');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#120c0c] px-4 py-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#120c0c] via-[#1a1a1a] to-[#2a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,_#4a1510_0%,_transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Header with MUFC theme */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#DAA520]">Trang Chủ</p>
            <h1 className="mt-1 text-3xl font-bold text-[#F4E9CE] uppercase tracking-wider">
              Old Trafford <span className="text-[#FFD700]">HQ</span>
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBackToHome}>
              Về Trang Chủ
            </Button>
            <Button variant="primary" onClick={handleStartQuiz}>
              English Quiz
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Todo input card */}
        <Card className="p-5">
          <form onSubmit={handleCreate} className="flex flex-col gap-3 md:flex-row">
            <Input
              label="Thêm nhiệm vụ"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Cần làm gì?"
            />
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto">
                Thêm
              </Button>
            </div>
          </form>
        </Card>

        {error ? (
          <div className="mt-4 rounded-md border border-[#C8102E]/30 bg-[#C8102E]/10 px-3 py-2 text-sm text-[#C8102E]">
            {error}
          </div>
        ) : null}

        {/* Todo list */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-[#F0C040]/20 bg-[#0a160d]/50 p-6 text-center text-sm text-[#F4E9CE]/70">
              Đang tải nhiệm vụ...
            </div>
          ) : (
            <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} onSaveTitle={handleSaveTitle} />
          )}
        </div>
      </div>
    </div>
  );
}
