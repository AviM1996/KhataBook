import React from 'react';
import styles from './ConfirmDeleteModal.module.css';

/**
 * Styled confirmation modal for destructive actions
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onCancel - Cancel click handler
 * @param {function} onConfirm - Confirm (Delete) click handler
 * @param {string} entityName - Name of the entity being deleted
 * @param {string} [title='Delete Record'] - Modal title
 * @param {boolean} [loading=false] - Disables buttons while deleting
 */
export default function ConfirmDeleteModal({
  isOpen,
  onCancel,
  onConfirm,
  entityName,
  title = 'Delete Record',
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <span className={styles.trashIcon}>🗑️</span>
        </div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>
          Are you sure you want to delete{' '}
          {entityName ? (
            <strong className={styles.name}>"{entityName}"</strong>
          ) : (
            'this record'
          )}
          ? This action cannot be undone.
        </p>

        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
