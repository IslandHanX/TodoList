// src/components/Toolbar.jsx
import { useEffect, useRef, useState } from "react";
import Select from "./Select";
import styles from "./Toolbar.module.css";

export default function Toolbar({
  q,
  setQ,
  status,
  setStatus,
  priority,
  setPriority,
}) {
  // local input value to debounce text search
  const [localQ, setLocalQ] = useState(q);
  const firstRender = useRef(true);
  const timer = useRef(null);

  // debounce the search text and push to parent after 300ms
  useEffect(() => {
    if (firstRender.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setQ(localQ), 300);
    return () => clearTimeout(timer.current);
  }, [localQ, setQ]);

  // mark first render so we don't fire a request on mount
  useEffect(() => {
    firstRender.current = false;
  }, []);

  // layout: search + status filter + priority filter
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchGroup}>
        <input
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Search title"
          className="input"
          aria-label="Search title"
        />
        {localQ && (
          <button
            type="button"
            className="button ghost"
            onClick={() => setLocalQ("")}
          >
            Clear
          </button>
        )}
      </div>

      <Select
        ariaLabel="Status"
        value={status}
        onChange={(v) => setStatus(v)} // updates parent; fetch handled upstream
        options={[
          { value: "all", label: "All" },
          { value: "completed", label: "Completed" },
          { value: "pending", label: "Pending" },
        ]}
        className="selectRoot"
      />

      <Select
        ariaLabel="Priority"
        value={priority}
        onChange={(v) => setPriority(v)} // updates parent; fetch handled upstream
        options={[
          { value: "", label: "All" },
          { value: "low", label: "low" },
          { value: "medium", label: "medium" },
          { value: "high", label: "high" },
        ]}
        className="selectRoot"
      />
    </div>
  );
}
