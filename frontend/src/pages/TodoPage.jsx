import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/reusable/Button';
import Card from '../components/reusable/Card';
import Input from '../components/reusable/Input';
import TodoList from '../components/todos/TodoList';
import api from '../services/api';
import { fetchFirstLevel } from '../services/levelService';

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
    try {
      const firstLevel = await fetchFirstLevel();
      navigate(`/play/${firstLevel.id}`);
    } catch (err) {
      setError('Failed to load quiz. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Todo App</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Your tasks</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleStartQuiz}>
              English Quiz
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <Card className="p-5">
          <form onSubmit={handleCreate} className="flex flex-col gap-3 md:flex-row">
            <Input
              label="Add a task"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to be done?"
            />
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto">
                Add Todo
              </Button>
            </div>
          </form>
        </Card>

        {error ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Loading todos...
            </div>
          ) : (
            <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} onSaveTitle={handleSaveTitle} />
          )}
        </div>
      </div>
    </div>
  );
}
