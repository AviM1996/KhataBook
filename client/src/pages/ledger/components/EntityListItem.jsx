import React from 'react';
import styles from './EntityListItem.module.css';

export default function EntityListItem({ entity, isActive, stats, lastTxDate, onClick }) {
  const initial = (entity.name || '?').charAt(0).toUpperCase();

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const dateStr = lastTxDate
    ? new Date(lastTxDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : '';

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatar}>{initial}</div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{entity.name}</span>
          {dateStr && <span className={styles.dateLabel}>{dateStr}</span>}
        </div>

        {entity.phone && (
          <div className={styles.phone}>{entity.phone}</div>
        )}

        {stats && (
          <div className={styles.statsRow}>
            <span className={styles.stat}>Sales {fmt(stats.totalDebit)}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.stat}>Rcvd {fmt(stats.totalCredit)}</span>
            <span className={styles.dot}>·</span>
            <span className={`${styles.stat} ${styles.outstanding}`}>
              Due {fmt(stats.outstanding)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
