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
      {/* app title */}
      <h1 className={styles.title}>📒 My Todo List</h1>

      <div className={styles.actions}>
        {/* view switcher: list */}
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

        {/* view switcher: calendar */}
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

        {/* view switcher: board */}
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

        {/* theme toggle button */}
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
