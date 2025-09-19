// src/components/TodoGrid.jsx
import Sticker from "./Sticker";
import styles from "./TodoGrid.module.css";

// responsive grid of todo cards
export default function TodoGrid({ todos, onToggle, onEdit, onDelete }) {
  return (
    <div className={styles.grid}>
      {todos.map((t) => (
        <Sticker
          key={t.id}
          todo={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
