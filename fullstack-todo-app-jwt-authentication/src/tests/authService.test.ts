process.env.DATABASE_URL = 'postgresql://localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';

import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from '../services/authService';
import { Role } from '@prisma/client';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and returns a token', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'new@example.com', passwordHash: 'hash', role: Role.STUDENT }),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.register({ email: 'New@Example.com', password: 'password123' });

    expect(result.user.email).toBe('new@example.com');
    expect(result.user.role).toBe(Role.STUDENT);
    expect(result.token).toBeDefined();
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('rejects duplicate email during registration', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'existing@example.com', role: Role.STUDENT }),
      create: jest.fn(),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.register({ email: 'existing@example.com', password: 'password123' })).rejects.toThrow('Email already registered.');
  });

  it('logs in an existing user with the correct password', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'existing@example.com', passwordHash, role: Role.STUDENT }),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.login({ email: 'existing@example.com', password: 'password123' });

    expect(result.user.id).toBe('user-1');
    expect(result.user.role).toBe(Role.STUDENT);
    expect(result.token).toBeDefined();
  });

  it('rejects login when no user exists', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.login({ email: 'missing@example.com', password: 'password123' })).rejects.toThrow('Invalid credentials.');
  });

  it('rejects login when user has no password (Google-only account)', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'u1', email: 'google-user@example.com', passwordHash: null, role: Role.STUDENT }),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.login({ email: 'google-user@example.com', password: 'password123' })).rejects.toThrow('Invalid credentials.');
  });

  it('rejects login when credentials are invalid', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'existing@example.com', passwordHash, role: Role.STUDENT }),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.login({ email: 'existing@example.com', password: 'wrong-password' })).rejects.toThrow('Invalid credentials.');
  });

  it('creates a new Google user when the ID token is valid and no local account exists', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({ sub: 'google-123', email: 'google@example.com', email_verified: true }),
    });
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({ verifyIdToken }));

    const userRepository = {
      findByGoogleId: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'user-google-1', email: 'google@example.com', passwordHash: null, googleId: 'google-123', role: Role.STUDENT }),
      linkGoogleAccount: jest.fn(),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.loginWithGoogle('valid-google-token');

    expect(verifyIdToken).toHaveBeenCalledWith({ idToken: 'valid-google-token', audience: 'google-client-id' });
    expect(userRepository.create).toHaveBeenCalledWith({ email: 'google@example.com', passwordHash: null, googleId: 'google-123', role: Role.STUDENT });
    expect(result.user.email).toBe('google@example.com');
    expect(result.user.role).toBe(Role.STUDENT);
    expect(result.token).toBeDefined();
  });

  it('logs in a Google user when a matching googleId already exists', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({ sub: 'google-123', email: 'google@example.com', email_verified: true }),
    });
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({ verifyIdToken }));

    const userRepository = {
      findByGoogleId: jest.fn().mockResolvedValue({ id: 'user-google-1', email: 'google@example.com', passwordHash: null, googleId: 'google-123', role: Role.STUDENT }),
      findByEmail: jest.fn(),
      create: jest.fn(),
      linkGoogleAccount: jest.fn(),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.loginWithGoogle('valid-google-token');

    expect(result.user.id).toBe('user-google-1');
    expect(result.user.role).toBe(Role.STUDENT);
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.linkGoogleAccount).not.toHaveBeenCalled();
  });

  it('links Google account to an existing local account without creating a duplicate user', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({ sub: 'google-123', email: 'existing@example.com', email_verified: true }),
    });
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({ verifyIdToken }));

    const userRepository = {
      findByGoogleId: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-local-1', email: 'existing@example.com', passwordHash: 'old-hash', role: Role.STUDENT }),
      create: jest.fn(),
      linkGoogleAccount: jest.fn().mockResolvedValue({ id: 'user-local-1', email: 'existing@example.com', passwordHash: 'old-hash', googleId: 'google-123', role: Role.STUDENT }),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.loginWithGoogle('valid-google-token');

    expect(userRepository.linkGoogleAccount).toHaveBeenCalledWith('user-local-1', 'google-123');
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(result.user.email).toBe('existing@example.com');
    expect(result.user.role).toBe(Role.STUDENT);
  });

  it('rejects a Google login when the Google email is not verified', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({ sub: 'google-123', email: 'unverified@example.com', email_verified: false }),
    });
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({ verifyIdToken }));

    const userRepository = {
      findByGoogleId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      linkGoogleAccount: jest.fn(),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.loginWithGoogle('valid-google-token')).rejects.toMatchObject({
      status: 401,
      message: 'Google email is not verified.',
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a Google login when the email is missing from the payload', async () => {
    const verifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({ sub: 'google-123', email_verified: true }),
    });
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({ verifyIdToken }));

    const userRepository = {
      findByGoogleId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      linkGoogleAccount: jest.fn(),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.loginWithGoogle('valid-google-token')).rejects.toMatchObject({
      status: 401,
      message: 'Google account email is missing.',
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('returns a generic 401 when the Google token is invalid or expired', async () => {
    const verifyIdToken = jest.fn().mockRejectedValue(new Error('Token expired'));
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({ verifyIdToken }));

    const userRepository = {
      findByGoogleId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      linkGoogleAccount: jest.fn(),
    };

    const service = new AuthService(userRepository as any);

    await expect(service.loginWithGoogle('expired-token')).rejects.toMatchObject({
      status: 401,
      message: 'Google authentication failed.',
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('creates a JWT token with role field in payload', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'admin@example.com', passwordHash: 'hash', role: Role.ADMIN }),
    };

    const service = new AuthService(userRepository as any);
    const result = await service.register({ email: 'admin@example.com', password: 'password123' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(result.token, 'test-secret') as { sub: string; email: string; role: string };

    expect(decoded.sub).toBe('user-1');
    expect(decoded.email).toBe('admin@example.com');
    expect(decoded.role).toBe(Role.ADMIN);
  });
});
