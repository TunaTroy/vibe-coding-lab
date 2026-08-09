import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRepository } from '../repositories/userRepository';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  private createToken(user: { id: string; email: string }): string {
    return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: '8h', // 8 hour session timeout for family use case
    });
  }

  private createAuthResult(user: { id: string; email: string }): AuthResult {
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token: this.createToken(user),
    };
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new Error('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.userRepository.create({
      email: normalizedEmail,
      passwordHash,
    });

    return this.createAuthResult(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error('Invalid credentials.');
    }

    if (!user.passwordHash) {
      throw new Error('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials.');
    }

    return this.createAuthResult(user);
  }

  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    let payload: any;

    try {
      const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      const authError = new Error('Google authentication failed.');
      (authError as Error & { status?: number }).status = 401;
      throw authError;
    }

    if (!payload || payload.email_verified !== true) {
      const authError = new Error('Google email is not verified.');
      (authError as Error & { status?: number }).status = 401;
      throw authError;
    }

    const googleId = payload.sub;
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      const authError = new Error('Google account email is missing.');
      (authError as Error & { status?: number }).status = 401;
      throw authError;
    }

    const existingByGoogleId = await this.userRepository.findByGoogleId(googleId);
    if (existingByGoogleId) {
      return this.createAuthResult(existingByGoogleId);
    }

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      const linkedUser = await this.userRepository.linkGoogleAccount(existingByEmail.id, googleId);
      return this.createAuthResult(linkedUser);
    }

    const createdUser = await this.userRepository.create({
      email,
      passwordHash: null,
      googleId,
    });

    return this.createAuthResult(createdUser);
  }
}
