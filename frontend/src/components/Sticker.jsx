import { useState } from "react";
import Select from "./Select";
import styles from "./Sticker.module.css";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin5Line, RiMoreFill } from "react-icons/ri"; // 横向三点
import { RiCheckLine, RiCloseLine } from "react-icons/ri";

export default function Sticker({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [priority, setPriority] = useState(todo.priority);
  const [expanded, setExpanded] = useState(false); // 仅保留展开/收起

  // 进入/取消/保存编辑
  function startEdit() {
    setExpanded(false); // 进入编辑前先收起
    setTitle(todo.title);
    setPriority(todo.priority);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setTitle(todo.title);
    setPriority(todo.priority);
  }
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
      <div className={styles.tape} aria-hidden="true" />

      {/* 固定：右上编辑 */}
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
      {/* 固定：右下删除 */}
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

      {/* 第一行：勾选 + 标题/输入 +（编辑态）按钮 */}
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

      {/* 固定：左下三点（所有卡都有） */}
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

      {/* 第二行：时间 + 优先级/下拉 */}
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
