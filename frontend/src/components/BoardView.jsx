// src/components/BoardView.jsx
import { useState } from "react";
import Sticker from "./Sticker";
import "./BoardView.css"; // 可选：把下面 CSS 放这里

export default function BoardView({ todos, onToggle, onDelete, onEdit }) {
  const pending = todos.filter(t=>!t.completed);
  const done = todos.filter(t=>t.completed);

  const [dragging, setDragging] = useState(null); // id

  function onDragStart(e, todo) {
    e.dataTransfer.setData("text/plain", String(todo.id));
    setDragging(todo.id);
  }
  function onDragEnd() { setDragging(null); }

  async function handleDrop(targetCompleted) {
    if (!dragging) return;
    const t = todos.find(x=>x.id === dragging);
    setDragging(null);
    if (!t || t.completed === targetCompleted) return;
    // 直接用你现成的切换逻辑（后端已支持 completed）
    await onToggle?.(t);
  }

  const renderCol = (title, items, targetCompleted) => (
    <div
      className="board-col"
      onDragOver={(e)=>e.preventDefault()}
      onDrop={()=>handleDrop(targetCompleted)}
    >
      <div className="board-col-head">{title} ({items.length})</div>
      <div className="board-col-body">
        {items.map(t=>(
          <div
            key={t.id}
            draggable
            onDragStart={(e)=>onDragStart(e,t)}
            onDragEnd={onDragEnd}
          >
            <Sticker
              todo={t}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="board">
      {renderCol("Pending", pending, false)}
      {renderCol("Completed", done, true)}
    </div>
  );
}
