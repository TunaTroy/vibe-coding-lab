process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';

import { TodoService } from '../services/todoService';

describe('TodoService', () => {
  it('lists todos for the authenticated user', async () => {
    const todoRepository = {
      findManyByUserId: jest.fn().mockResolvedValue([{ id: 'todo-1', title: 'Write docs', done: false }]),
    };

    const service = new TodoService(todoRepository as any);
    const todos = await service.listTodos('user-1');

    expect(todos).toHaveLength(1);
    expect(todoRepository.findManyByUserId).toHaveBeenCalledWith('user-1');
  });

  it('creates a new todo for the authenticated user', async () => {
    const todoRepository = {
      create: jest.fn().mockResolvedValue({ id: 'todo-2', title: 'Ship feature', done: false }),
    };

    const service = new TodoService(todoRepository as any);
    const todo = await service.createTodo('user-1', { title: ' Ship feature ' });

    expect(todo.title).toBe('Ship feature');
    expect(todoRepository.create).toHaveBeenCalledWith({ userId: 'user-1', title: 'Ship feature' });
  });

  it('updates an existing todo owned by the user', async () => {
    const todoRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue({ id: 'todo-3', userId: 'user-1', title: 'Old', done: false }),
      update: jest.fn().mockResolvedValue({ id: 'todo-3', userId: 'user-1', title: 'Updated', done: true }),
    };

    const service = new TodoService(todoRepository as any);
    const todo = await service.updateTodo('user-1', 'todo-3', { title: ' Updated ', done: true });

    expect(todo.title).toBe('Updated');
    expect(todoRepository.update).toHaveBeenCalledWith('todo-3', { title: 'Updated', done: true });
  });

  it('updates only the done flag when title is omitted', async () => {
    const todoRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue({ id: 'todo-3', userId: 'user-1', title: 'Old', done: false }),
      update: jest.fn().mockResolvedValue({ id: 'todo-3', userId: 'user-1', title: 'Old', done: true }),
    };

    const service = new TodoService(todoRepository as any);
    const todo = await service.updateTodo('user-1', 'todo-3', { done: true });

    expect(todo.done).toBe(true);
    expect(todoRepository.update).toHaveBeenCalledWith('todo-3', { done: true });
  });

  it('rejects updates for todos not owned by the user', async () => {
    const todoRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };

    const service = new TodoService(todoRepository as any);

    await expect(service.updateTodo('user-1', 'todo-404', { title: 'Nope' })).rejects.toThrow('Todo not found.');
  });

  it('deletes an existing todo owned by the user', async () => {
    const todoRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue({ id: 'todo-4', userId: 'user-1', title: 'Delete me', done: false }),
      delete: jest.fn().mockResolvedValue({ id: 'todo-4' }),
    };

    const service = new TodoService(todoRepository as any);
    const todo = await service.deleteTodo('user-1', 'todo-4');

    expect(todo.id).toBe('todo-4');
    expect(todoRepository.delete).toHaveBeenCalledWith('todo-4');
  });

  it('rejects deletion for todos not owned by the user', async () => {
    const todoRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };

    const service = new TodoService(todoRepository as any);

    await expect(service.deleteTodo('user-1', 'todo-404')).rejects.toThrow('Todo not found.');
  });
});
