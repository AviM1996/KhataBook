import React from 'react';
import styles from './SearchBar.module.css';

/**
 * Reusable SearchBar component
 * @param {string} value - Current search query
 * @param {function} onChange - Change handler
 * @param {string} [placeholder='Search...'] - Placeholder text
 */
export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '', style }) {
  return (
    <div className={`${styles.searchWrapper} ${className}`} style={style}>
      <span className={styles.searchIcon}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
