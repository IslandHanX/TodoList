// src/hooks/useTodos.js
import { useCallback, useMemo, useState } from "react";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../services/todos";
import { orderTodos } from "../utils/orderTodos";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (filters) => {
    setLoading(true);
    setError("");
    try {
      const data = await listTodos(filters);
      setTodos(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      setError(e.message || "Failed to load todos.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async ({ title, priority = "low" }) => {
    const clean = (title || "").trim();
    if (!clean) throw new Error("Please enter a title.");
    const created = await createTodo({
      title: clean,
      completed: false,
      priority,
    });
    setTodos((prev) => [created, ...prev]);
    return created;
  }, []);

  const toggle = useCallback(async (todo) => {
    const updated = await updateTodo(todo.id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  }, []);

  const edit = useCallback(async (id, patch) => {
    const updated = await updateTodo(id, patch);
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const orderedTodos = useMemo(() => orderTodos(todos), [todos]);

  return { todos, orderedTodos, loading, error, load, add, toggle, edit, remove };
}
