// src/services/todos.js
import { apiClient } from "../lib/apiClient";

// list with optional filters; skips default values to keep URLs tidy
export async function listTodos({ q, status = "all", priority } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (priority) params.set("priority", priority);
  const qs = params.toString();
  return apiClient.get(qs ? `/todos?${qs}` : "/todos");
}

// CRUD helpers
export const createTodo = (data) => apiClient.post("/todos", data);
export const updateTodo = (id, patch) => apiClient.put(`/todos/${id}`, patch);
export const deleteTodo = (id) => apiClient.delete(`/todos/${id}`);
