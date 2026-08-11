process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';

import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/requireAuth';
import { Role } from '@prisma/client';

describe('requireAuth', () => {
  it('returns 401 when no token is provided', () => {
    const req = { cookies: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid tokens', () => {
    const req = { cookies: { token: 'invalid' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches the user payload for valid tokens', () => {
    const token = jwt.sign({ sub: 'u1', email: 'test@example.com', role: Role.STUDENT }, 'test-secret');
    const req = { cookies: { token } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual({ id: 'u1', email: 'test@example.com', role: Role.STUDENT });
    expect(next).toHaveBeenCalled();
  });
});
