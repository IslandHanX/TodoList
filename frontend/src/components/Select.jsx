// frontend/src/components/Select.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Select.module.css";

export default function Select({
  value,
  onChange,
  options = [], // array of { value, label }
  placeholder = "Select",
  ariaLabel = "Select",
  className = "", // extra className passthrough for layout hooks
  style,
}) {
  // popover open/close state
  const [open, setOpen] = useState(false);

  // element refs for click-outside, focus return, and list keyboard nav
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  // find the index of the current value for keyboard navigation
  const indexByValue = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );
  const [activeIndex, setActiveIndex] = useState(
    indexByValue >= 0 ? indexByValue : 0
  );

  // close when clicking outside the component or pressing Escape
  useEffect(() => {
    function onDocDown(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function onDocKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onDocKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onDocKey);
    };
  }, []);

  // when opening, scroll the active option into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  useEffect(() => {
    if (indexByValue >= 0) setActiveIndex(indexByValue);
  }, [indexByValue]);

  // commit a selection and return focus to the trigger
  function commit(i) {
    const opt = options[i];
    if (!opt) return;
    onChange?.(opt.value);
    setOpen(false);
    btnRef.current?.focus();
  }

  // keyboard support on the trigger button
  function onTriggerKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  }

  // keyboard support inside the listbox
  function onListKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(activeIndex);
    }
  }

  // label shown on the trigger (fallback to placeholder)
  const label = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <div
      ref={rootRef}
      className={`${styles.selectRoot} ${className}`}
      style={style}
    >
      <button
        type="button"
        ref={btnRef}
        // merge global button skin and module layout styles
        className={`selectTrigger ${styles.selectTrigger}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
      >
        <span className={styles.selectValue}>{label}</span>
        <svg
          className={`${styles.selectCaret} ${
            open ? styles.selectCaretOpen : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>

      {open && (
        <div
          className={styles.selectMenu}
          role="listbox"
          tabIndex={-1}
          ref={listRef}
          onKeyDown={onListKey}
        >
          {options.map((opt, i) => {
            const selected = opt.value === value;
            const active = i === activeIndex;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={selected}
                data-active={active ? "true" : undefined}
                className={[
                  styles.selectOption,
                  selected ? styles.selectOptionSelected : "",
                  active ? styles.selectOptionActive : "",
                ].join(" ")}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(i)}
              >
                <span>{opt.label}</span>
                {selected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
