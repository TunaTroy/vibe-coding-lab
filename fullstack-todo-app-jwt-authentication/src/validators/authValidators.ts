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
  .refine((data: any) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

// fail Payload Validation: nếu thiếu field answer hoặc answer = null/undefined thì Zod sẽ reject luôn khi parse, không cần check thủ công nữa
// export const submitLevelSchema = z.object({
//   levelId: z.string().min(1, 'Level ID is required.'),
//   answers: z.array(
//     z.object({
//       questionId: z.string().min(1, 'Question ID is required.'),
//       answer: z.any(),
//     })
//   ),
// });

export const submitLevelSchema = z.object({
  levelId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      // Thay z.any() bằng union các kiểu answer thật sự có thể có,
      // để tương lai thêm Matching/Cloze (answer dạng string[]) vẫn mở rộng được
      answer: z.union([z.string(), z.number(), z.array(z.number())]),
    })
  ).min(1),
});
