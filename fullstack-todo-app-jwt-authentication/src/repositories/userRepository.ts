import { prisma } from '../config/prisma';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
      },
    });
  }
}
