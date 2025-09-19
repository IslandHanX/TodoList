import { useMemo } from "react";
import styles from "./CalendarSplit.module.css";

function fmtYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function startOfWeek(d) {
  const x = new Date(d);
  const wd = x.getDay(); // 0 Sun
  x.setDate(x.getDate() - wd);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function MiniCalendar({
  monthDate,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onSelectDate,
  daysWithTodos = new Set(),
}) {
  const monthStart = startOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart);
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [monthDate]
  );

  const header = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={styles.sidebar}>
      <div className={styles.sideHeader}>
        <button
          className={styles.navBtn}
          onClick={onPrevMonth}
          aria-label="Prev month"
        >
          ←
        </button>
        <div className={styles.monthTitle}>
          {monthDate.getFullYear()} /{" "}
          {String(monthDate.getMonth() + 1).padStart(2, "0")}
        </div>
        <button
          className={styles.navBtn}
          onClick={onNextMonth}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className={styles.weekHeader}>
        {header.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className={styles.miniGrid}>
        {cells.map((d) => {
          const key = fmtYMD(d);
          const isOther = d.getMonth() !== monthDate.getMonth();
          const isSelected = fmtYMD(selectedDate) === key;
          const hasTodo = daysWithTodos.has(key);
          return (
            <button
              key={key}
              className={`${styles.miniCell} ${isOther ? styles.dim : ""} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => onSelectDate(d)}
              aria-label={key}
              title={key}
            >
              <span>{d.getDate()}</span>
              {hasTodo && <span className={styles.dot} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
