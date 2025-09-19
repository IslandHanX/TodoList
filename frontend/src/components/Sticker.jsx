// src/components/Sticker.jsx
import { useState } from "react";
import Select from "./Select";
import styles from "./Sticker.module.css";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin5Line, RiMoreFill } from "react-icons/ri"; // horizontal ellipsis icon
import { RiCheckLine, RiCloseLine } from "react-icons/ri";

export default function Sticker({ todo, onToggle, onDelete, onEdit }) {
  // edit mode state
  const [editing, setEditing] = useState(false);
  // local form fields
  const [title, setTitle] = useState(todo.title);
  const [priority, setPriority] = useState(todo.priority);
  // expand/collapse for extra actions
  const [expanded, setExpanded] = useState(false);

  // enter edit mode with fresh values
  function startEdit() {
    setExpanded(false);
    setTitle(todo.title);
    setPriority(todo.priority);
    setEditing(true);
  }
  // cancel edits and restore original
  function cancelEdit() {
    setEditing(false);
    setTitle(todo.title);
    setPriority(todo.priority);
  }
  // persist edits via parent handler
  async function saveEdit() {
    const nextTitle = (title || "").trim();
    if (!nextTitle) return;
    await onEdit?.(todo.id, { title: nextTitle, priority });
    setEditing(false);
  }

  return (
    <article
      className={`${styles.card} ${todo.completed ? styles.completed : ""}`}
    >
      {/* decorative tape */}
      <div className={styles.tape} aria-hidden="true" />

      {/* fixed edit button in the top-right when not editing */}
      {!editing && (
        <button
          className={`${styles.iconBtn} ${styles.editFixed}`}
          onClick={startEdit}
          aria-label="Edit"
          title="Edit"
        >
          <MdOutlineEdit size={18} />
        </button>
      )}

      {/* fixed delete button in the bottom-right when not editing */}
      {!editing && (
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.iconDanger} ${styles.deleteFixed}`}
          onClick={() => onDelete?.(todo.id)}
          title="Delete"
          aria-label="Delete"
        >
          <RiDeleteBin5Line size={18} />
        </button>
      )}

      {/* row: checkbox + title or textarea + edit actions */}
      <div className={`${styles.row} ${editing ? styles.isEditing : ""}`}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle?.(todo)}
          />
        </label>

        {!editing ? (
          <h3
            className={`${styles.title} ${!expanded ? styles.clamp : ""} ${
              todo.completed ? styles.done : ""
            }`}
          >
            {todo.title}
          </h3>
        ) : (
          <textarea
            className={`input ${styles.editInput}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Edit title…"
            rows={3}
          />
        )}

        <div className={styles.right}>
          {editing && (
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.actionPrimary}`}
                onClick={saveEdit}
                aria-label="Save"
                title="Save"
              >
                <RiCheckLine size={18} />
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.actionGhost}`}
                onClick={cancelEdit}
                aria-label="Cancel"
                title="Cancel"
              >
                <RiCloseLine size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* fixed three-dots toggle in the bottom-left when not editing */}
      {!editing && (
        <button
          className={`${styles.iconBtn} ${styles.moreBtn}`}
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
          title={expanded ? "Collapse" : "Expand"}
        >
          <RiMoreFill size={18} />
        </button>
      )}

      {/* meta row: timestamp + priority or priority selector */}
      <div className={styles.metaRow}>
        <time className={styles.time}>
          {new Date(todo.createdAt).toLocaleString()}
        </time>

        {!editing ? (
          <span className={`${styles.badge} ${styles[`pri_${todo.priority}`]}`}>
            {todo.priority}
          </span>
        ) : (
          <Select
            ariaLabel="Priority"
            value={priority}
            onChange={setPriority}
            options={[
              { value: "low", label: "low" },
              { value: "medium", label: "medium" },
              { value: "high", label: "high" },
            ]}
            className={styles.prioritySelect}
          />
        )}
      </div>
    </article>
  );
}
