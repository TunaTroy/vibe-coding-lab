process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';

import { z } from 'zod';
import { AuthController } from '../controllers/authController';

describe('AuthController', () => {
  it('registers a user and sets a cookie', async () => {
    const authService = {
      register: jest.fn().mockResolvedValue({ user: { id: 'u1', email: 'test@example.com' }, token: 'token-1' }),
    };
    const controller = new AuthController(authService as any);

    const req = { body: { email: 'test@example.com', password: 'password123' } } as any;
    const res = {
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('logs in a user and sets a cookie', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue({ user: { id: 'u1', email: 'test@example.com' }, token: 'token-1' }),
    };
    const controller = new AuthController(authService as any);

    const req = { body: { email: 'test@example.com', password: 'password123' } } as any;
    const res = {
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await controller.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns validation errors for invalid registration payloads', async () => {
    const controller = new AuthController({ register: jest.fn() } as any);
    const req = { body: { email: 'bad-email', password: '123' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error.' }));
  });

  it('returns validation errors for invalid login payloads', async () => {
    const controller = new AuthController({ login: jest.fn() } as any);
    const req = { body: { email: 'bad-email', password: '' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error.' }));
  });

  it('passes registration errors to next middleware', async () => {
    const error = new Error('boom');
    const authService = { register: jest.fn().mockRejectedValue(error) };
    const controller = new AuthController(authService as any);
    const req = { body: { email: 'test@example.com', password: 'password123' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.register(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('passes login errors to next middleware', async () => {
    const error = new Error('boom');
    const authService = { login: jest.fn().mockRejectedValue(error) };
    const controller = new AuthController(authService as any);
    const req = { body: { email: 'test@example.com', password: 'password123' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
