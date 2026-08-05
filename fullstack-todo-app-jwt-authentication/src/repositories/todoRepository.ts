import { prisma } from '../config/prisma';

export interface TodoRecord {
  id: string;
  userId: string;
  title: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoInput {
  userId: string;
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  done?: boolean;
}

export class TodoRepository {
  async findManyByUserId(userId: string): Promise<TodoRecord[]> {
    return prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(input: CreateTodoInput): Promise<TodoRecord> {
    return prisma.todo.create({
      data: {
        userId: input.userId,
        title: input.title,
      },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<TodoRecord | null> {
    return prisma.todo.findFirst({ where: { id, userId } });
  }

  async update(id: string, input: UpdateTodoInput): Promise<TodoRecord> {
    return prisma.todo.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<TodoRecord> {
    return prisma.todo.delete({ where: { id } });
  }
}
