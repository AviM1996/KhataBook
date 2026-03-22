import React, { memo, useMemo } from 'react';
import styles from './ContactCard.module.css';

function ContactCard({
  initial,
  name,
  phone,
  dateLabel,
  stats,
  isActive,
  onClick
}) {

  // ✅ Memoize stats rendering
  const statsContent = useMemo(() => {
    if (!stats) return null;

    return stats.map((stat, idx) => (
      <React.Fragment key={stat.label || idx}>
        <span className={`${styles.stat} ${stat.className || ''}`}>
          {stat.label} {stat.value}
        </span>
        {idx < stats.length - 1 && <span className={styles.dot}>·</span>}
      </React.Fragment>
    ));
  }, [stats]);

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className={styles.avatar}>
        {initial || name?.charAt(0)?.toUpperCase() || '?'}
      </div>

      <div className={styles.info}>
        {/* Name + Date */}
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          {dateLabel && (
            <span className={styles.dateLabel}>{dateLabel}</span>
          )}
        </div>

        {/* Phone */}
        {phone && (
          <div className={styles.phone}>{phone}</div>
        )}

        {/* Stats */}
        {statsContent && (
          <div className={styles.statsRow}>
            {statsContent}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Prevent unnecessary re-renders
export default memo(ContactCard);