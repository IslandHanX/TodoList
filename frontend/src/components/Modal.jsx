// src/components/Modal.jsx
import styles from "./Modal.module.css";

export default function Modal({ open, title, message, onClose }) {
  // do not render anything when closed
  if (!open) return null;

  // close on Escape key
  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose} // click outside to close
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={styles.modal}
        onClick={
          (e) => e.stopPropagation() /* // keep clicks inside from closing */
        }
      >
        {title && (
          <h2 id="modal-title" className={styles.modalTitle}>
            {title}
          </h2>
        )}
        {message && <p className={styles.modalMessage}>{message}</p>}
        <div className={styles.modalActions}>
          {/* // use type="button" so it won't submit any parent form */}
          <button type="button" className="button primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
