import React from 'react';
import styles from './EmptyState.module.css';

/**
 * Reusable Empty State component
 * @param {string} title - The main heading text
 * @param {string} description - The secondary explanation text
 * @param {React.ReactNode} [icon] - Optional icon rendering above the title
 */
export default function EmptyState({ title, description, icon }) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
