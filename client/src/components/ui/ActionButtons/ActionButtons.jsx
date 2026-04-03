import React from 'react';
import styles from './ActionButtons.module.css';
import MoreMenu from '../MoreMenu/MoreMenu';
import Button from '../Button/Button';
import { useModal } from '../../../context/ModalContext';

export default function ActionButtons({ 
  onViewLedger, 
  onEdit, 
  onDelete, 
  menuItems,
  editModalProps, // New: props for global 'createEdit' modal
  deleteModalProps // New: props for global 'confirmDelete' modal
}) {
  const { openModal } = useModal();

  const handleViewLedger = (e) => {
    e.stopPropagation();
    onViewLedger?.();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (editModalProps) {
      openModal('createEdit', editModalProps);
    } else {
      onEdit?.();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (deleteModalProps) {
      openModal('confirmDelete', deleteModalProps);
    } else {
      onDelete?.();
    }
  };

  const isNewMode = Boolean(onViewLedger || menuItems?.length);

  return (
    <div className={styles.actions}>

      {isNewMode ? (
        <>
          {onViewLedger && (
            <Button
              className={`${styles.btn} ${styles.viewLedger}`}
              onClick={handleViewLedger}
            >
              View Ledger
            </Button>
          )}

          {menuItems?.length > 0 && (
            <MoreMenu items={menuItems} />
          )}
        </>
      ) : (
        <>
          {onEdit && (
            <Button className={`${styles.btn} ${styles.edit}`} onClick={handleEdit}>
              Edit
            </Button>
          )}

          {onDelete && (
            <Button className={`${styles.btn} ${styles.delete}`} onClick={handleDelete}>
              Delete
            </Button>
          )}
        </>
      )}
    </div>
  );
}
