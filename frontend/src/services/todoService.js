import { apiFetch } from "./api";

/* ============================================================
   Todo service — gọi backend THẬT (mount tại /todos, requireAuth).
   Routes (src/routes/todoRoutes.ts):
     GET /todos · POST /todos · PUT /todos/:id · DELETE /todos/:id
   Validators: createTodoSchema { title }, updateTodoSchema { title?, done? }
   Wire format dùng field `done` (model Prisma) — service map sang
   `completed` cho UI để component giữ nguyên 100%.
   ============================================================ */

function toUi(wire) {
  return { id: wire.id, title: wire.title, completed: wire.done, createdAt: wire.createdAt };
}

/** GET /todos → { todos } */
export async function fetchTodos() {
  const data = await apiFetch("/todos");
  return { todos: data.todos.map(toUi) };
}

/** POST /todos — body createTodoSchema { title } → { todo } */
export async function createTodo(title) {
  const data = await apiFetch("/todos", {
    method: "POST",
    body: { title },
  });
  return { todo: toUi(data.todo) };
}

/** PUT /todos/:id — body updateTodoSchema { done } → { todo } */
export async function toggleTodo(id, done) {
  const data = await apiFetch(`/todos/${id}`, {
    method: "PUT",
    body: { done },
  });
  return { todo: toUi(data.todo) };
}

/** DELETE /todos/:id */
export async function deleteTodo(id) {
  await apiFetch(`/todos/${id}`, { method: "DELETE" });
}
