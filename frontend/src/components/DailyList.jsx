// src/components/DailyList.jsx
import Sticker from "./Sticker";
import styles from "./CalendarSplit.module.css";

// format a date-like value as YYYY-MM-DD for grouping
function ymd(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DailyList({ date, todos, onToggle, onDelete, onEdit }) {
  // compute the day key once from the selected date
  const key = ymd(date);
  // show only todos created on the selected day
  const list = (todos || []).filter((t) => ymd(t.createdAt) === key);

  return (
    <div className={styles.main}>
      {/* header with date and count */}
      <div className={styles.dayHeader}>
        <h3>
          {key}
          <span className={styles.count}>
            {" "}
            {list.length} task{list.length === 1 ? "" : "s"}
          </span>
        </h3>
      </div>

      {/* empty state vs. grid of todo cards */}
      {list.length === 0 ? (
        <div className={styles.empty}>No todos for this day.</div>
      ) : (
        <div className={styles.grid}>
          {list.map((todo) => (
            <Sticker
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
