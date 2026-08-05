import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { loginSchema, registerSchema } from '../validators/authValidators';

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
        maxAge: 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: 'Registered successfully.',
        user: result.user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error.',
          errors: error.flatten().fieldErrors,
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
        maxAge: 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Logged in successfully.',
        user: result.user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error.',
          errors: error.flatten().fieldErrors,
        });
      }

      next(error);
    }
  };
}
