import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { TodoService } from '../services/todoService';
import { createTodoSchema, updateTodoSchema } from '../validators/authValidators';

export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const todos = await this.todoService.listTodos(userId);
      return res.status(200).json({ todos });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const payload = createTodoSchema.parse(req.body);
      const todo = await this.todoService.createTodo(userId, payload);
      return res.status(201).json({ todo });
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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const todoId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload = updateTodoSchema.parse(req.body);
      const todo = await this.todoService.updateTodo(userId, todoId, payload);
      return res.status(200).json({ todo });
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

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const todoId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const todo = await this.todoService.deleteTodo(userId, todoId);
      return res.status(200).json({ todo, message: 'Todo deleted.' });
    } catch (error) {
      next(error);
    }
  };
}
