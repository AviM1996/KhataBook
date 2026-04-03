import React, { memo, useMemo, useCallback } from 'react';
import styles from './ContactCard.module.css';

function getStates({ stats, activeTab, outstanding }) {
  if (stats?.length) return stats;
  if (activeTab === 'customer' || activeTab === 'supplier') {
    return [
      {
        label: 'Due',
        value: `₹${Number(outstanding || 0).toLocaleString('en-IN')}`,
        className: styles.outstanding,
      },
    ];
  }
  return [];
}

function ContactCard({
  id,
  initial,
  name,
  phone,
  dateLabel,
  stats,
  isActive,
  onClick,
  activeTab,
  outstanding
}) {

  const handleClick = useCallback(() => {if (onClick) onClick(id)}, [onClick, id]);
  const derivedStats = getStates({ stats, activeTab, outstanding });

  const statsContent = useMemo(() => {
    const arr = Array.isArray(derivedStats) ? derivedStats : [];
    if (arr.length > 0) {
      return arr.map((stat, idx) => (
        <React.Fragment key={stat.label || idx}>
          <span className={`${styles.stat} ${stat.className || ''}`}>
            {stat.label} {stat.value}
          </span>
          {idx < arr.length - 1 && <span className={styles.dot}>·</span>}
        </React.Fragment>
      ));
    }
    return null;
  }, [derivedStats]);

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
    >
      <div className={styles.avatar}>
        {initial || name?.charAt(0)?.toUpperCase() || '?'}    
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{name}</span>
          {dateLabel && (
            <span className={styles.dateLabel}>{dateLabel}</span>
          )}
        </div>
        {phone && (
          <div className={styles.phone}>{phone}</div>
        )}

        {statsContent && (
          <div className={styles.statsRow}>
            {statsContent}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ContactCard);