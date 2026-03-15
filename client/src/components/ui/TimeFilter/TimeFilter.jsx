import React from 'react';
import styles from './TimeFilter.module.css';

const DEFAULT_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

/**
 * Reusable TimeFilter - segmented pill buttons for time period selection
 * @param {Array<{id: string, label: string}>} [options] - Filter options
 * @param {string} active - Currently active filter ID
 * @param {function} onChange - Callback with selected filter ID
 */
export default function TimeFilter({ options = DEFAULT_OPTIONS, active, onChange }) {
  return (
    <div className={styles.filterGroup}>
      {options.map((opt) => (
        <button
          key={opt.id}
          className={`${styles.pill} ${active === opt.id ? styles.active : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
