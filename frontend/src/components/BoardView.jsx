// src/components/BoardView.jsx
import { useState } from "react";
import Sticker from "./Sticker";
import "./BoardView.css"; // styles for the two-column board layout

export default function BoardView({ todos, onToggle, onDelete, onEdit }) {
  // split todos into pending and completed lists
  const pending = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  // track the id of the item currently being dragged
  const [dragging, setDragging] = useState(null);

  // begin drag: stash the id and populate the dataTransfer payload
  function onDragStart(e, todo) {
    setDragging(todo.id);
  }

  // end drag: clear local drag state
  function onDragEnd() {
    setDragging(null);
  }

  // drop handler: if moved across columns, toggle completion via parent callback
  async function handleDrop(targetCompleted) {
    if (!dragging) return;
    const t = todos.find((x) => x.id === dragging);
    setDragging(null);
    if (!t || t.completed === targetCompleted) return;
    await onToggle?.(t);
  }

  // render one column with a header and list of draggable stickers
  const renderCol = (title, items, targetCompleted) => (
    <div
      className="board-col"
      onDragOver={(e) => e.preventDefault()} // allow dropping by preventing default
      onDrop={() => handleDrop(targetCompleted)} // move item to this column
    >
      <div className="board-col-head">
        {title} ({items.length})
      </div>
      <div className="board-col-body">
        {items.map((t) => (
          <div
            key={t.id}
            draggable // make wrapper draggable so Sticker stays simple
            onDragStart={(e) => onDragStart(e, t)}
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

  // two columns: left = pending, right = completed
  return (
    <div className="board">
      {renderCol("Pending", pending, false)}
      {renderCol("Completed", done, true)}
    </div>
  );
}
