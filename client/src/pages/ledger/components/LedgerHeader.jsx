import React from 'react';
import styles from './LedgerHeader.module.css';

export default function LedgerHeader({ entity, activeTab, stats, onBack }) {
  const initial = (entity.name || '?').charAt(0).toUpperCase();
  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

  return (
    <div className={styles.header}>
      <button className={styles.backBtn} onClick={onBack} aria-label="Go back" title="Go back">
        ←
      </button>


      <div className={styles.avatar}>{initial}</div>

      <div className={styles.details}>
        <div className={styles.name}>{entity.name}</div>
        <div className={styles.meta}>
          {entity.phone && <span>☎ {entity.phone}</span>}
          {entity.address && <span> · {entity.address}</span>}
        </div>
      </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{activeTab === 'customer' ? 'Sales' : 'Purchase'}</span>
            <span className={styles.statValue}>{fmt(stats.totalDebit)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{activeTab === 'customer' ? 'Received' : 'Paid'}</span>
            <span className={styles.statValue}>{fmt(stats.totalCredit)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Outstanding</span>
            <span className={`${styles.statValue} ${stats.outstanding > 0 ? styles.red : styles.green}`}>
              {fmt(Math.abs(stats.outstanding))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
