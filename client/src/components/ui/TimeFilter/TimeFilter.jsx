import React from 'react';
import styles from './TimeFilter.module.css';
import Button from '../Button/Button';


const DEFAULT_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function TimeFilter({ options = DEFAULT_OPTIONS, active, onChange }) {
  return (
    <div className={styles.filterGroup}>
      {options.map((opt) => (
        <Button
          key={opt.id}
          className={`${styles.pill} ${active === opt.id ? styles.active : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
