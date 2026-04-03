import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './MoreMenu.module.css';
import Button from '../Button/Button';

export default function MoreMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (ref.current && !ref.current.contains(e.target)) &&
        (dropdownRef.current && !dropdownRef.current.contains(e.target))
      ) {
        setOpen(false);
      }
    };
    
    // Close on any scroll (important for fixed portals so they don't float freely)
    const handleScroll = (e) => {
      // Don't close if scrolling inside the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      if (open) setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true); 
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const isDropUp = spaceBelow < 180;
      setDropUp(isDropUp);
      
      if (isDropUp) {
        setCoords({
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 4,
          right: window.innerWidth - rect.right,
          zIndex: 99999
        });
      } else {
        setCoords({
          position: 'fixed',
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
          zIndex: 99999
        });
      }
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <Button
        className={styles.trigger}
        onClick={handleToggle}
        aria-label="More actions"
        title="More actions"
      >
        ⋮
      </Button>

      {open && typeof document !== 'undefined' && createPortal(
        <div 
          className={`${styles.dropdown} ${dropUp ? styles.dropUp : ''}`} 
          style={coords}
          ref={dropdownRef}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className={styles.divider} />
            ) : (
              <Button
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
              </Button>
            )
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
