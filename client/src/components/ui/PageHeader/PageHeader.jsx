import React from 'react';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, center, right }) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {center && <div className={styles.center}>{center}</div>}
      {right && <div className={styles.right}>{right}</div>}
    </div>
  );
}
