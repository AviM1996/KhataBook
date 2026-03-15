import React, { useState, useRef, useEffect } from 'react';
import styles from './MoreMenu.module.css';

/**
 * Three-dot (⋮) dropdown menu component
 * @param {Array<{label: string, onClick: function, danger?: boolean}>} items
 */
export default function MoreMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label="More actions"
        title="More actions"
      >
        ⋮
      </button>

      {open && (
        <div className={styles.dropdown}>
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className={styles.divider} />
            ) : (
              <button
                key={i}
                className={`${styles.item} ${item.danger ? styles.danger : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
