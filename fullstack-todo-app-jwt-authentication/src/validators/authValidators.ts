import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Email must be a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email must be a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const googleLoginSchema = z.object({
  idToken: z.string().trim().min(1, 'Google ID token is required.'),
});

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
});

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1, 'Title must not be empty.').optional(),
    done: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });
