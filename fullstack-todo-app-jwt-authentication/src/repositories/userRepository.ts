import { prisma } from '../config/prisma';

export interface CreateUserInput {
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { googleId } });
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash ?? null,
        googleId: input.googleId ?? null,
      },
    });
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<UserRecord> {
    return prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  }
}
