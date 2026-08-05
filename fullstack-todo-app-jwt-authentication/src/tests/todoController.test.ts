process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';

import { TodoController } from '../controllers/todoController';

describe('TodoController', () => {
  it('lists todos for the authenticated user', async () => {
    const todoService = { listTodos: jest.fn().mockResolvedValue([{ id: '1', title: 'Write docs', done: false }]) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'u1', email: 'test@example.com' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.list(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ todos: [{ id: '1', title: 'Write docs', done: false }] }));
  });

  it('creates a todo for the authenticated user', async () => {
    const todoService = { createTodo: jest.fn().mockResolvedValue({ id: 'todo-1', title: 'Ship feature', done: false }) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, body: { title: 'Ship feature' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.create(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ todo: { id: 'todo-1', title: 'Ship feature', done: false } }));
  });

  it('passes list errors to next middleware', async () => {
    const error = new Error('boom');
    const controller = new TodoController({ listTodos: jest.fn().mockRejectedValue(error) } as any);
    const req = { user: { id: 'u1', email: 'test@example.com' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.list(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('returns validation errors for invalid todo creation payload', async () => {
    const controller = new TodoController({ createTodo: jest.fn() } as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, body: { title: '   ' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.create(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error.' }));
  });

  it('passes create errors to next middleware', async () => {
    const error = new Error('boom');
    const controller = new TodoController({ createTodo: jest.fn().mockRejectedValue(error) } as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, body: { title: 'Write docs' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.create(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('returns validation errors for invalid todo update payloads', async () => {
    const controller = new TodoController({ updateTodo: jest.fn() } as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, params: { id: '1' }, body: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.update(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error.' }));
  });

  it('accepts array-style todo ids in update requests', async () => {
    const todoService = { updateTodo: jest.fn().mockResolvedValue({ id: '1', title: 'Write docs', done: true }) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, params: { id: ['1'] }, body: { done: true } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.update(req, res, jest.fn());

    expect(todoService.updateTodo).toHaveBeenCalledWith('u1', '1', { done: true });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 401 when the user is not authenticated for list requests', async () => {
    const controller = new TodoController({ listTodos: jest.fn() } as any);
    const req = { user: undefined } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.list(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when the user is not authenticated for create requests', async () => {
    const controller = new TodoController({ createTodo: jest.fn() } as any);
    const req = { user: undefined, body: { title: 'Hello' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.create(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('updates a todo for the current user', async () => {
    const todoService = { updateTodo: jest.fn().mockResolvedValue({ id: '1', title: 'Write docs', done: true }) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, params: { id: '1' }, body: { done: true } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.update(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ todo: { id: '1', title: 'Write docs', done: true } }));
  });

  it('returns 401 when the user is not authenticated for update requests', async () => {
    const controller = new TodoController({ updateTodo: jest.fn() } as any);
    const req = { user: undefined, params: { id: '1' }, body: { done: true } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.update(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when the user is not authenticated for delete requests', async () => {
    const controller = new TodoController({ deleteTodo: jest.fn() } as any);
    const req = { user: undefined, params: { id: '1' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.delete(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('blocks cross-user todo access by forwarding ownership errors to next middleware', async () => {
    const error = new Error('Todo not found.');
    const todoService = { updateTodo: jest.fn().mockRejectedValue(error) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'user-a', email: 'a@example.com' }, params: { id: 'todo-b' }, body: { done: true } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.update(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ todo: expect.anything() }));
  });

  it('passes delete errors to next middleware when ownership check fails', async () => {
    const error = new Error('Todo not found.');
    const todoService = { deleteTodo: jest.fn().mockRejectedValue(error) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'user-a', email: 'a@example.com' }, params: { id: 'todo-b' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.delete(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('accepts array-style todo ids in delete requests', async () => {
    const todoService = { deleteTodo: jest.fn().mockResolvedValue({ id: '1' }) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, params: { id: ['1'] } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.delete(req, res, jest.fn());

    expect(todoService.deleteTodo).toHaveBeenCalledWith('u1', '1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deletes a todo for the current user', async () => {
    const todoService = { deleteTodo: jest.fn().mockResolvedValue({ id: '1' }) };
    const controller = new TodoController(todoService as any);
    const req = { user: { id: 'u1', email: 'test@example.com' }, params: { id: '1' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.delete(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Todo deleted.' }));
  });
});
