import React from 'react';
import { MdDelete } from 'react-icons/md';
import styles from './ConfirmDeleteModal.module.css';
import Button from '../Button/Button'

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
          <span className={styles.trashIcon}><MdDelete /></span>
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
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            icon={<MdDelete />}
            className={styles.deleteBtn}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
