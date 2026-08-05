describe('env config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('loads env values from process.env', () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
    process.env.JWT_SECRET = 'test-secret';

    const { env } = require('../config/env');

    expect(env.JWT_SECRET).toBe('test-secret');
    expect(env.PORT).toBe(4000);
  });

  it('uses default PORT and NODE_ENV when optional values are missing', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/todo_app';
    process.env.JWT_SECRET = 'test-secret';
    delete process.env.PORT;
    delete process.env.NODE_ENV;

    const { env } = require('../config/env');

    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('throws when required env values are missing', () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;

    expect(() => require('../config/env')).toThrow('DATABASE_URL is required');
  });
});
