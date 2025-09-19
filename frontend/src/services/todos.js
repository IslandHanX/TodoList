// src/services/todos.js
import { apiClient } from "../lib/apiClient";

export async function listTodos({ q, status = "all", priority } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (priority) params.set("priority", priority);
  return apiClient.get(`/todos?${params.toString()}`);
}

export const createTodo = (data) => apiClient.post("/todos", data);
export const updateTodo = (id, patch) => apiClient.put(`/todos/${id}`, patch);
export const deleteTodo = (id) => apiClient.delete(`/todos/${id}`);
