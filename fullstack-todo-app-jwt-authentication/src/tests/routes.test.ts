process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todo_app';
process.env.JWT_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';

import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

describe('HTTP routes', () => {
  const createdUserIds: string[] = [];

  const makeEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

  afterEach(async () => {
    if (createdUserIds.length === 0) {
      return;
    }

    await prisma.todo.deleteMany({
      where: { userId: { in: createdUserIds } },
    });

    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });

    createdUserIds.length = 0;
  });

  it('registers a user through /auth/register and sets JWT cookie', async () => {
    const email = makeEmail('register-user');
    const res = await request(app)
      .post('/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      createdUserIds.push(user.id);
      expect(user.role).toBe(Role.STUDENT);
    }

    expect(res.body.message).toBe('Registered successfully.');
    expect(res.body.user.role).toBe(Role.STUDENT);
    expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('token=')]));
  });

  it('logs in a user through /auth/login and sets JWT cookie', async () => {
    const email = makeEmail('login-user');
    const password = 'password123';
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        googleId: null,
        role: Role.STUDENT,
      },
    });
    createdUserIds.push(created.id);

    const res = await request(app)
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body.message).toBe('Logged in successfully.');
    expect(res.body.user.role).toBe(Role.STUDENT);
    expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('token=')]));
  });

  it('returns 400 for invalid auth payloads', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);

    expect(res.body.message).toBe('Validation error.');
  });

  it('returns 400 for invalid Google idToken payload', async () => {
    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: '' })
      .expect(400);

    expect(res.body.message).toBe('Validation error.');
  });

  it('rejects Google login with unverified email (401, no user created)', async () => {
    const email = makeEmail('unverified-google-user');
    const initialUserCount = await prisma.user.count({ where: { email } });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'invalid-unverified-token' })
      .expect(401);

    expect(res.body.message).toBe('Google authentication failed.');

    const finalUserCount = await prisma.user.count({ where: { email } });
    expect(finalUserCount).toBe(initialUserCount);
  });

  it('links Google account to existing local user (no duplicate user created)', async () => {
    const email = makeEmail('link-google-user');
    const password = 'password123';
    const existingUser = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        googleId: null,
        role: Role.STUDENT,
      },
    });
    createdUserIds.push(existingUser.id);

    const initialUserCount = await prisma.user.count({ where: { email } });

    const res = await request(app)
      .post('/auth/google')
      .send({ idToken: 'invalid-token-for-link-test' })
      .expect(401);

    const finalUserCount = await prisma.user.count({ where: { email } });
    expect(finalUserCount).toBe(initialUserCount);
  });

  it('requires authentication for protected todo routes', async () => {
    await request(app).get('/todos').expect(401);
    await request(app).post('/todos').send({ title: 'Protected todo' }).expect(401);
  });

  it('creates and lists todos for the authenticated user', async () => {
    const email = makeEmail('todo-user');
    const password = 'password123';
    const agent = request.agent(app);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        googleId: null,
        role: Role.STUDENT,
      },
    });
    createdUserIds.push(created.id);

    const loginRes = await agent
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginRes.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('token=')]));

    const createRes = await agent
      .post('/todos')
      .send({ title: 'Route todo' })
      .expect(201);

    expect(createRes.body.todo).toMatchObject({
      title: 'Route todo',
      userId: created.id,
    });

    const listRes = await agent.get('/todos').expect(200);
    expect(listRes.body.todos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createRes.body.todo.id,
          title: 'Route todo',
          userId: created.id,
        }),
      ]),
    );
  });

  it('updates and deletes todos for the authenticated user', async () => {
    const email = makeEmail('todo-update-user');
    const password = 'password123';
    const agent = request.agent(app);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        googleId: null,
        role: Role.STUDENT,
      },
    });
    createdUserIds.push(created.id);

    await agent.post('/auth/login').send({ email, password }).expect(200);

    const createRes = await agent.post('/todos').send({ title: 'Editable todo' }).expect(201);
    const todoId = createRes.body.todo.id;

    const updateRes = await agent.put(`/todos/${todoId}`).send({ done: true }).expect(200);
    expect(updateRes.body.todo).toMatchObject({
      id: todoId,
      title: 'Editable todo',
      done: true,
    });

    const deleteRes = await agent.delete(`/todos/${todoId}`).expect(200);
    expect(deleteRes.body.message).toBe('Todo deleted.');
  });

  it('GET /auth/me returns user info with role when authenticated', async () => {
    const email = makeEmail('me-user');
    const password = 'password123';
    const agent = request.agent(app);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        googleId: null,
        role: Role.ADMIN,
      },
    });
    createdUserIds.push(created.id);

    await agent.post('/auth/login').send({ email, password }).expect(200);

    const meRes = await agent.get('/auth/me').expect(200);
    expect(meRes.body.user).toMatchObject({
      id: created.id,
      email: created.email,
      role: Role.ADMIN,
    });
  });

  it('GET /auth/me returns 401 when not authenticated', async () => {
    await request(app).get('/auth/me').expect(401);
  });

  it('GET /api/admin/test returns 403 for STUDENT role', async () => {
    const email = makeEmail('student-user');
    const password = 'password123';
    const agent = request.agent(app);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        googleId: null,
        role: Role.STUDENT,
      },
    });
    createdUserIds.push(created.id);

    await agent.post('/auth/login').send({ email, password }).expect(200);

    await agent.get('/api/admin/test').expect(403);
  });

  it('GET /api/admin/test returns 200 for ADMIN role', async () => {
    const email = makeEmail('admin-user');
    const password = 'password123';
    const agent = request.agent(app);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        googleId: null,
        role: Role.ADMIN,
      },
    });
    createdUserIds.push(created.id);

    await agent.post('/auth/login').send({ email, password }).expect(200);

    const res = await agent.get('/api/admin/test').expect(200);
    expect(res.body.message).toBe('Admin access granted.');
  });

  it('GET /api/admin/test returns 401 when not authenticated', async () => {
    await request(app).get('/api/admin/test').expect(401);
  });
});
