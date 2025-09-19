// src/components/Header.jsx
import styles from "./Header.module.css";
import {
  MdDarkMode,
  MdLightMode,
  MdViewList,
  MdCalendarMonth,
} from "react-icons/md";
import { TbLayoutKanban } from "react-icons/tb";

export default function Header({ dark, onToggleTheme, view, setView }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>📒 My Todo List</h1>

      <div className={styles.actions}>
        {/* 视图切换：List / Calendar / Board */}
        <button
          className={`${styles.iconBtn} ${
            view === "list" ? styles.active : ""
          }`}
          onClick={() => setView("list")}
          aria-label="List view"
          title="List view"
        >
          <MdViewList size={20} />
        </button>
        <button
          className={`${styles.iconBtn} ${
            view === "calendar" ? styles.active : ""
          }`}
          onClick={() => setView("calendar")}
          aria-label="Calendar view"
          title="Calendar view"
        >
          <MdCalendarMonth size={20} />
        </button>
        <button
          className={`${styles.iconBtn} ${
            view === "board" ? styles.active : ""
          }`}
          onClick={() => setView("board")}
          aria-label="Board view"
          title="Board view"
        >
          <TbLayoutKanban size={20} />
        </button>

        {/* 主题切换：跟在右边 */}
        <button
          className={styles.iconBtn}
          onClick={onToggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>
      </div>
    </header>
  );
}
