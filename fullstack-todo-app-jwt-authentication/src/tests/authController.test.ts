process.env.DATABASE_URL = 'postgresql://localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';

import { AuthController } from '../controllers/authController';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  it('registers a user and sets a cookie', async () => {
    const authService = {
      register: jest.fn().mockResolvedValue({ user: { id: 'u1', email: 'test@example.com', role: Role.STUDENT }, token: 'token-1' }),
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
      login: jest.fn().mockResolvedValue({ user: { id: 'u1', email: 'test@example.com', role: Role.STUDENT }, token: 'token-1' }),
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

  it('logs in a user with Google and sets a cookie', async () => {
    const authService = {
      loginWithGoogle: jest.fn().mockResolvedValue({ user: { id: 'u1', email: 'test@example.com', role: Role.STUDENT }, token: 'token-1' }),
    };
    const controller = new AuthController(authService as any);

    const req = { body: { idToken: 'google-token' } } as any;
    const res = {
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await controller.googleLogin(req, res, next);

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

  it('returns 401 for Google auth failures without leaking provider details', async () => {
    const authService = {
      loginWithGoogle: jest.fn().mockRejectedValue(Object.assign(new Error('Google authentication failed.'), { status: 401 })),
    };
    const controller = new AuthController(authService as any);
    const req = { body: { idToken: 'bad-google-token' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.googleLogin(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Google authentication failed.' });
  });

  it('returns validation error for invalid Google idToken payload', async () => {
    const authService = { loginWithGoogle: jest.fn() };
    const controller = new AuthController(authService as any);
    const req = { body: { idToken: '' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await controller.googleLogin(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error.' }));
  });

  it('passes non-401 Google auth errors to next middleware', async () => {
    const error = new Error('Database connection failed');
    const authService = { loginWithGoogle: jest.fn().mockRejectedValue(error) };
    const controller = new AuthController(authService as any);
    const req = { body: { idToken: 'valid-token' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.googleLogin(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
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

  it('returns 401 when getMe is called without authenticated user', async () => {
    const controller = new AuthController({} as any);
    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns user info with role when getMe is called with authenticated user', async () => {
    const controller = new AuthController({} as any);
    const req = { user: { id: 'u1', email: 'test@example.com', role: Role.ADMIN } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await controller.getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: 'u1',
        email: 'test@example.com',
        role: Role.ADMIN,
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
