import React from 'react';
import MoreMenu from '../MoreMenu/MoreMenu';
import styles from './TimelineBubble.module.css';

export default function TimelineBubble({
  align = 'left',
  badgeText,
  amount,
  metaText,
  noteText,
  timestamp,
  type = 'default',
  onEdit,
  onDelete,
}) {
  return (
    <div className={`${styles.bubble} ${styles[align]} ${styles[type]}`}>
      <div className={styles.card}>
        <div className={styles.typeRow}>
          <span className={styles.typeBadge}>{badgeText}</span>
          {(onEdit || onDelete) && (
            <MoreMenu
              items={[
                ...(onEdit ? [{ label: 'Edit', onClick: onEdit }] : []),
                ...(onDelete ? [{ label: 'Delete', danger: true, onClick: onDelete }] : [])
              ]}
            />
          )}
        </div>

        <div className={styles.amount}>
          {amount}
        </div>

        {metaText && (
          <div className={styles.meta}>
            <span>{metaText}</span>
          </div>
        )}

        {noteText && (
          <div className={styles.note}>{noteText}</div>
        )}

        <span className={styles.timestamp}>{timestamp}</span>
      </div>
    </div>
  );
}
