import React from 'react';
import styles from './AvatarHeader.module.css';

export default function AvatarHeader({
  title,
  subtitleLeft,
  subtitleRight,
  avatarText,
  stats,
  onBack,
  backLabel = "←"
}) {
  return (
    <div className={styles.header}>
      {onBack && (
        <button
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Go back"
          title="Go back"
        >
          {backLabel}
        </button>
      )}

      {avatarText && (
        <div className={styles.avatar}>{avatarText}</div>
      )}

      <div className={styles.details}>
        <div className={styles.title}>{title}</div>
        {(subtitleLeft || subtitleRight) && (
          <div className={styles.meta}>
            {subtitleLeft && <span>{subtitleLeft}</span>}
            {subtitleLeft && subtitleRight && <span> · </span>}
            {subtitleRight && <span>{subtitleRight}</span>}
          </div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.stat}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={`${styles.statValue} ${stat.className || ''}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
