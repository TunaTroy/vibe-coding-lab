import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { googleLoginSchema, loginSchema, registerSchema } from '../validators/authValidators';
import { Role } from '@prisma/client';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = registerSchema.parse(req.body);
      const result = await this.authService.register(payload);

      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      return res.status(201).json({
        message: 'Registered successfully.',
        user: result.user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error.',
          errors: (error as z.ZodError).flatten().fieldErrors,
        });
      }

      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = loginSchema.parse(req.body);
      const result = await this.authService.login(payload);

      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      return res.status(200).json({
        message: 'Logged in successfully.',
        user: result.user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error.',
          errors: (error as z.ZodError).flatten().fieldErrors,
        });
      }

      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = googleLoginSchema.parse(req.body);
      const result = await this.authService.loginWithGoogle(payload.idToken);

      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      return res.status(200).json({
        message: 'Google login successful.',
        user: result.user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error.',
          errors: (error as z.ZodError).flatten().fieldErrors,
        });
      }

      if (error instanceof Error && 'status' in error && (error as Error & { status?: number }).status === 401) {
        return res.status(401).json({
          message: 'Google authentication failed.',
        });
      }

      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return res.status(200).json({
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      return res.status(200).json({
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
