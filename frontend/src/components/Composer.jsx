// src/components/Composer.jsx
import { useEffect, useRef, useState } from "react";
import Select from "./Select";
import styles from "./Composer.module.css";
import { RiMicFill, RiMicOffFill, RiAddLine } from "react-icons/ri"; // icons for mic and add

export default function Composer({ onAdd }) {
  // input fields
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");

  // voice input state and refs
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);

  // buffers for building the dictated text
  const baseRef = useRef(""); // text that existed when recording started
  const finalRef = useRef(""); // accumulated confirmed (final) transcript

  // set up Web Speech API recognition and wire event handlers
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    // when recording begins, snapshot current input and clear the final buffer
    rec.onstart = () => {
      baseRef.current = title;
      finalRef.current = "";
    };

    // on each result, fold in the latest final and keep only the newest interim
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalRef.current +=
            (finalRef.current ? " " : "") + r[0].transcript.trim();
        } else {
          interim = r[0].transcript.trim();
        }
      }
      // live value = base + final + interim (interim is display-only)
      const composed = [baseRef.current, finalRef.current, interim]
        .filter(Boolean)
        .join(" ");
      setTitle(composed);
    };

    // stop state if the engine ends or errors
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);

    recRef.current = rec;
  }, [title]);

  // start/stop the speech recognizer
  function toggleVoice() {
    const rec = recRef.current;
    if (!rec) return; // unsupported
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

  // submit new todo via parent callback and reset fields
  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({ title, priority: priority || "low" });
    setTitle("");
    setPriority("");
  }

  // layout: input + mic button, priority select, and add button
  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task…"
          className="input"
        />
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
