import styles from "./Modal.module.css";

export default function Modal({ open, title, message, onClose }) {
  if (!open) return null;

  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {title && (
          <h2 id="modal-title" className={styles.modalTitle}>
            {title}
          </h2>
        )}
        {message && <p className={styles.modalMessage}>{message}</p>}
        <div className={styles.modalActions}>
          {/* 关键：避免触发表单提交 */}
          <button type="button" className="button primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
