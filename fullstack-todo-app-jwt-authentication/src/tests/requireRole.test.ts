process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';

import { requireRole } from '../middleware/requireRole';
import { Role } from '@prisma/client';

describe('requireRole', () => {
  it('returns 401 when req.user is missing', () => {
    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    const middleware = requireRole(Role.ADMIN);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role does not match required role', () => {
    const req = { user: { id: 'u1', email: 'student@example.com', role: Role.STUDENT } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    const middleware = requireRole(Role.ADMIN);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user role matches required role', () => {
    const req = { user: { id: 'u1', email: 'admin@example.com', role: Role.ADMIN } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    const middleware = requireRole(Role.ADMIN);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next when user role is in allowed roles array', () => {
    const req = { user: { id: 'u1', email: 'admin@example.com', role: Role.ADMIN } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    const middleware = requireRole(Role.ADMIN, Role.STUDENT);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next when user role is STUDENT and allowed roles include STUDENT', () => {
    const req = { user: { id: 'u1', email: 'student@example.com', role: Role.STUDENT } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    const middleware = requireRole(Role.ADMIN, Role.STUDENT);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user role is not in allowed roles array', () => {
    const req = { user: { id: 'u1', email: 'student@example.com', role: Role.STUDENT } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    const middleware = requireRole(Role.ADMIN);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden.' });
    expect(next).not.toHaveBeenCalled();
  });
});
