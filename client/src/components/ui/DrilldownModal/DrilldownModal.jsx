import React, { useEffect, useRef } from 'react';
import styles from './DrilldownModal.module.css';

/**
 * DrilldownModal – SaaS-style slide-over panel showing drilled-down data
 * @param {boolean} open - Whether the modal is visible
 * @param {function} onClose - Close handler
 * @param {string} title - Modal header title
 * @param {string} [subtitle] - Optional subtitle/context
 * @param {React.ReactNode} children - Modal body content
 */
export default function DrilldownModal({ open, onClose, title, subtitle, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * DrilldownTable – Reusable table for drilldown modal content
 * @param {Array<string>} columns - Column headers
 * @param {Array<Array<any>>} rows - Row data as arrays matching columns
 */
export function DrilldownTable({ columns = [], rows = [] }) {
  if (!rows.length) {
    return <div className={styles.emptyState}>No data found for this selection</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
