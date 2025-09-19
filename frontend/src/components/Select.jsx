// frontend/src/components/Select.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Select.module.css";

export default function Select({
  value,
  onChange,
  options = [], // [{ value:"low", label:"low" }, ...]
  placeholder = "Select",
  ariaLabel = "Select",
  className = "", // 兼容：透传到根节点，便于额外布局
  style,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const indexByValue = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );
  const [activeIndex, setActiveIndex] = useState(
    indexByValue >= 0 ? indexByValue : 0
  );

  // 关闭菜单：点击外部 & ESC
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

  // 打开菜单后滚动到活动项
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function commit(i) {
    const opt = options[i];
    if (!opt) return;
    onChange?.(opt.value);
    setOpen(false);
    btnRef.current?.focus();
  }

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
        /* 叠加全局外观 + 模块布局样式 */
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
