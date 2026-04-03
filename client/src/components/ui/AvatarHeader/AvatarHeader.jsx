import React, { useState } from 'react';
import styles from './AvatarHeader.module.css';
import { EyeToggle } from '../eyeIcons/eyeIcons';

export default function AvatarHeader({
  title,
  subtitleLeft,
  subtitleRight,
  avatarText,
  stats,
  creditStats,
  onBack,
  backLabel = "←"
}) {
  const [isCreditVisible, setIsCreditVisible] = useState(false);

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
        <div className={styles.titleWrap}>
          <div className={styles.title}>{title}</div>
          <EyeToggle 
            isVisible={isCreditVisible} 
            onToggle={() => setIsCreditVisible(!isCreditVisible)}
            className={styles.eyeBtn}
          />
        </div>
        
        {(subtitleLeft || subtitleRight) && (
          <div className={styles.meta}>
            {subtitleLeft && <span>{subtitleLeft}</span>}
            {subtitleLeft && subtitleRight && <span> · </span>}
            {subtitleRight && <span>{subtitleRight}</span>}
          </div>
        )}

        {isCreditVisible && creditStats && creditStats.length > 0 && (
          <div className={styles.creditInfo}>
            {creditStats.map((cs, idx) => (
              <div key={idx} className={styles.creditItem}>
                <span className={styles.creditLabel}>{cs.label}:</span>
                <span className={`${styles.creditValue} ${cs.className || ''}`}>
                  {cs.value}
                </span>
              </div>
            ))}
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
