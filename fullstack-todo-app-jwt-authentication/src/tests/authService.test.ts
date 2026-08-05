process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';

import bcrypt from 'bcryptjs';
import { AuthService } from '../services/authService';

describe('AuthService', () => {
  it('registers a new user and returns a token', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'new@example.com', passwordHash: 'hash' }),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.register({ email: 'New@Example.com', password: 'password123' });

    expect(result.user.email).toBe('new@example.com');
    expect(result.token).toBeDefined();
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('rejects duplicate email during registration', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'existing@example.com' }),
      create: jest.fn(),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.register({ email: 'existing@example.com', password: 'password123' })).rejects.toThrow('Email already registered.');
  });

  it('logs in an existing user with the correct password', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'existing@example.com', passwordHash }),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.login({ email: 'existing@example.com', password: 'password123' });

    expect(result.user.id).toBe('user-1');
    expect(result.token).toBeDefined();
  });

  it('rejects login when no user exists', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.login({ email: 'missing@example.com', password: 'password123' })).rejects.toThrow('Invalid credentials.');
  });

  it('rejects login when credentials are invalid', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'existing@example.com', passwordHash }),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.login({ email: 'existing@example.com', password: 'wrong-password' })).rejects.toThrow('Invalid credentials.');
  });
});
