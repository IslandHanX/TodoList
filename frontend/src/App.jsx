// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import "./index.css";

import Header from "./components/Header";
import Composer from "./components/Composer";
import Toolbar from "./components/Toolbar";
import TodoGrid from "./components/TodoGrid";
import BoardView from "./components/BoardView";
import Modal from "./components/Modal";

import MiniCalendar from "./components/MiniCalendar";
import DailyList from "./components/DailyList";
// import calSplitStyles from "./components/CalendarSplit.module.css";

import { useTheme } from "./hooks/useTheme";
import { useTodos } from "./hooks/useTodos";

export default function App() {
  // 主题
  const { dark, setDark } = useTheme();

  // 业务：todos
  const { orderedTodos, loading, error, load, add, toggle, edit, remove } =
    useTodos();

  // 筛选 & 视图
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("");
  const [view, setView] = useState("list"); // 'list' | 'calendar' | 'board'

  // 小日历状态
  const [miniMonth, setMiniMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const daysWithTodos = useMemo(() => {
    const s = new Set();
    for (const t of orderedTodos) {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      s.add(key);
    }
    return s;
  }, [orderedTodos]);

  // 弹窗
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const openModal = (title, message) =>
    setModal({ open: true, title, message });
  const closeModal = () => setModal({ open: false, title: "", message: "" });

  // 首次加载
  useEffect(() => {
    load({ q, status, priority }).catch((e) =>
      openModal("Search failed", e.message || "Something went wrong.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选变化 → 自动请求
  useEffect(() => {
    (async () => {
      try {
        const data = await load({ q, status, priority });
        const filtered = q || status !== "all" || priority;
        if (filtered && Array.isArray(data) && data.length === 0) {
          openModal("No results", "No todos match your current filters.");
        }
      } catch (e) {
        openModal("Search failed", e.message || "Something went wrong.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, priority]);

  // 公用：按当前筛选刷新
  async function applyFilters() {
    try {
      const data = await load({ q, status, priority });
      const filtered = q || status !== "all" || priority;
      if (filtered && Array.isArray(data) && data.length === 0) {
        openModal("No results", "No todos match your current filters.");
      }
    } catch (e) {
      openModal("Search failed", e.message || "Something went wrong.");
    }
  }

  // CRUD 回调
  async function handleAdd({ title, priority }) {
    try {
      await add({ title, priority });
      await applyFilters();
    } catch (e) {
      openModal("Add failed", e.message || "Please try again.");
    }
  }
  async function handleToggle(todo) {
    try {
      await toggle(todo);
      await applyFilters();
    } catch (e) {
      openModal("Update failed", e.message || "Could not update.");
    }
  }
  async function handleEdit(id, patch) {
    try {
      await edit(id, patch);
      await applyFilters();
    } catch (e) {
      openModal("Update failed", e.message || "Could not update.");
    }
  }
  async function handleDelete(id) {
    try {
      await remove(id);
      await applyFilters();
    } catch (e) {
      openModal("Delete failed", e.message || "Could not delete.");
    }
  }

  return (
    <div>
      <Header
        dark={dark}
        onToggleTheme={() => setDark((v) => !v)}
        view={view}
        setView={setView}
      />

      <div className="container">
        <Composer onAdd={handleAdd} />

        {/* 工具条（自动应用筛选） */}
        <Toolbar
          q={q}
          setQ={setQ}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
        />

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="text-mute">Loading…</div>
        ) : view === "calendar" ? (
          <div className="calendarStack">
            <MiniCalendar
              monthDate={miniMonth}
              onPrevMonth={() =>
                setMiniMonth(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
                )
              }
              onNextMonth={() =>
                setMiniMonth(
                  (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
                )
              }
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(new Date(d))}
              daysWithTodos={daysWithTodos}
            />
            <DailyList
              date={selectedDate}
              todos={orderedTodos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        ) : view === "board" ? (
          <BoardView
            todos={orderedTodos}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <TodoGrid
            todos={orderedTodos}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  );
}
