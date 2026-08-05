import { TodoRepository, UpdateTodoInput } from '../repositories/todoRepository';

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInputDto extends UpdateTodoInput {}

export class TodoService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async listTodos(userId: string) {
    return this.todoRepository.findManyByUserId(userId);
  }

  async createTodo(userId: string, input: CreateTodoInput) {
    return this.todoRepository.create({ userId, title: input.title.trim() });
  }

  async updateTodo(userId: string, todoId: string, input: UpdateTodoInputDto) {
    const existingTodo = await this.todoRepository.findByIdAndUserId(todoId, userId);
    if (!existingTodo) {
      throw new Error('Todo not found.');
    }

    const updatePayload: UpdateTodoInput = {};
    if (input.title !== undefined) {
      updatePayload.title = input.title.trim();
    }
    if (input.done !== undefined) {
      updatePayload.done = input.done;
    }

    return this.todoRepository.update(todoId, updatePayload);
  }

  async deleteTodo(userId: string, todoId: string) {
    const existingTodo = await this.todoRepository.findByIdAndUserId(todoId, userId);
    if (!existingTodo) {
      throw new Error('Todo not found.');
    }

    return this.todoRepository.delete(todoId);
  }
}
