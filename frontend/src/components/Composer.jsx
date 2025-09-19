import { useEffect, useRef, useState } from "react";
import Select from "./Select";
import styles from "./Composer.module.css";
import { RiMicFill, RiMicOffFill, RiAddLine } from "react-icons/ri"; // ← 用纯加号

export default function Composer({ onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);

  const baseRef = useRef(""); // 开始时的文本
  const finalRef = useRef(""); // 已确认的最终结果累积

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true; // 允许临时结果
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      baseRef.current = title; // 记住开始时已有内容
      finalRef.current = "";
    };

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalRef.current +=
            (finalRef.current ? " " : "") + r[0].transcript.trim();
        } else {
          interim = r[0].transcript.trim(); // 只保留“当前临时片段”
        }
      }
      // 用 base + final + interim 组装“当前显示值”（临时片段只是替换展示）
      const composed = [baseRef.current, finalRef.current, interim]
        .filter(Boolean)
        .join(" ");
      setTitle(composed);
    };

    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);

    recRef.current = rec;
  }, [title]);

  function toggleVoice() {
    const rec = recRef.current;
    if (!rec) return; // 不支持
    if (recording) {
      try {
        rec.stop();
      } catch {}
      setRecording(false);
    } else {
      setRecording(true);
      try {
        rec.start();
      } catch {}
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({ title, priority: priority || "low" });
    setTitle("");
    setPriority("");
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task…"
          className="input"
        />
        {/* 语音按钮：不支持时可隐藏或置灰 */}
        <button
          type="button"
          className="button ghost"
          onClick={toggleVoice}
          disabled={!recRef.current}
          title={
            !recRef.current
              ? "Speech not supported"
              : recording
              ? "Stop"
              : "Speak"
          }
          aria-pressed={recording}
        >
          {recording ? <RiMicOffFill /> : <RiMicFill />}
        </button>
      </div>
      <Select
        ariaLabel="Priority"
        value={priority}
        onChange={setPriority}
        options={[
          { value: "low", label: "low" },
          { value: "medium", label: "medium" },
          { value: "high", label: "high" },
        ]}
        placeholder="low"
        className={styles.select}
      />
      <button
        type="submit"
        className={styles.addBtn}
        aria-label="Add"
        title="Add"
      >
        <RiAddLine size={20} />
      </button>
    </form>
  );
}
