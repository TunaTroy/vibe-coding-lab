import { prisma } from '../config/prisma';
import { TodoRepository } from '../repositories/todoRepository';
import { UserRepository } from '../repositories/userRepository';

describe('Repository integration tests', () => {
  const createdUserIds: string[] = [];
  const userRepository = new UserRepository();
  const todoRepository = new TodoRepository();

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

  it('UserRepository stores and reads users by email', async () => {
    const email = `user-${Date.now()}@example.com`;
    const created = await userRepository.create({
      email,
      passwordHash: 'hashed-password',
    });
    createdUserIds.push(created.id);

    const found = await userRepository.findByEmail(email);

    expect(found).not.toBeNull();
    expect(found).toMatchObject({
      id: created.id,
      email,
      passwordHash: 'hashed-password',
    });
  });

  it('UserRepository stores and reads users by Google ID', async () => {
    const googleId = `google-${Date.now()}`;
    const email = `google-user-${Date.now()}@example.com`;
    const created = await userRepository.create({
      email,
      passwordHash: null,
      googleId,
    });
    createdUserIds.push(created.id);

    const found = await userRepository.findByGoogleId(googleId);

    expect(found).not.toBeNull();
    expect(found).toMatchObject({
      id: created.id,
      email,
      googleId,
      passwordHash: null,
    });
  });

  it('UserRepository links Google account to existing user', async () => {
    const email = `link-user-${Date.now()}@example.com`;
    const created = await userRepository.create({
      email,
      passwordHash: 'hashed-password',
    });
    createdUserIds.push(created.id);

    const googleId = `google-link-${Date.now()}`;
    const linked = await userRepository.linkGoogleAccount(created.id, googleId);

    expect(linked).toMatchObject({
      id: created.id,
      email,
      googleId,
      passwordHash: 'hashed-password',
    });

    const foundByGoogleId = await userRepository.findByGoogleId(googleId);
    expect(foundByGoogleId).not.toBeNull();
    expect(foundByGoogleId?.id).toBe(created.id);
  });

  it('TodoRepository only returns todos for the matching userId', async () => {
    const userA = await prisma.user.create({
      data: { email: `user-a-${Date.now()}@example.com`, passwordHash: 'hash-a', googleId: null },
    });
    const userB = await prisma.user.create({
      data: { email: `user-b-${Date.now()}@example.com`, passwordHash: 'hash-b', googleId: null },
    });
    createdUserIds.push(userA.id, userB.id);

    const protectedTodo = await todoRepository.create({
      userId: userB.id,
      title: 'User B todo',
    });

    const foundForOwner = await todoRepository.findByIdAndUserId(protectedTodo.id, userB.id);
    const foundForOtherUser = await todoRepository.findByIdAndUserId(protectedTodo.id, userA.id);
    const listForOwner = await todoRepository.findManyByUserId(userB.id);
    const listForOtherUser = await todoRepository.findManyByUserId(userA.id);

    expect(foundForOwner).toMatchObject({
      id: protectedTodo.id,
      userId: userB.id,
      title: 'User B todo',
    });
    expect(foundForOtherUser).toBeNull();
    expect(listForOwner.some((todo) => todo.id === protectedTodo.id)).toBe(true);
    expect(listForOtherUser.some((todo) => todo.id === protectedTodo.id)).toBe(false);
  });

  it('TodoRepository updates and deletes the correct todo record', async () => {
    const user = await prisma.user.create({
      data: { email: `user-c-${Date.now()}@example.com`, passwordHash: 'hash-c', googleId: null },
    });
    createdUserIds.push(user.id);

    const createdTodo = await todoRepository.create({
      userId: user.id,
      title: 'Original title',
    });

    const updated = await todoRepository.update(createdTodo.id, {
      title: 'Updated title',
      done: true,
    });

    expect(updated).toMatchObject({
      id: createdTodo.id,
      userId: user.id,
      title: 'Updated title',
      done: true,
    });

    const deleted = await todoRepository.delete(createdTodo.id);

    expect(deleted).toMatchObject({
      id: createdTodo.id,
      userId: user.id,
      title: 'Updated title',
    });

    const afterDelete = await prisma.todo.findUnique({ where: { id: createdTodo.id } });
    expect(afterDelete).toBeNull();
  });
});
