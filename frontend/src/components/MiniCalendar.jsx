// src/components/MiniCalendar.jsx
import { useMemo } from "react";
import styles from "./CalendarSplit.module.css";

// format Date -> YYYY-MM-DD
function fmtYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// first day of the given month
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// start of week (Sunday) for a given date
function startOfWeek(d) {
  const x = new Date(d);
  const wd = x.getDay(); // 0 = Sun
  x.setDate(x.getDate() - wd);
  x.setHours(0, 0, 0, 0);
  return x;
}

// add n days to a date (returns new Date)
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
  // compute the first visible day (start of the week containing month start)
  const monthStart = startOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart);

  // 6 weeks x 7 days = 42 cells to cover all months
  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [monthDate]
  );

  // weekday labels
  const header = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={styles.sidebar}>
      {/* month header with navigation controls */}
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

      {/* weekday header row */}
      <div className={styles.weekHeader}>
        {header.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* 42-day calendar grid */}
      <div className={styles.miniGrid}>
        {cells.map((d) => {
          const key = fmtYMD(d);
          const isOther = d.getMonth() !== monthDate.getMonth(); // outside current month
          const isSelected = fmtYMD(selectedDate) === key; // current selection
          const hasTodo = daysWithTodos.has(key); // show dot if tasks exist
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
