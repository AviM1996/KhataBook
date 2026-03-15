import React from 'react';
import styles from './ActionButtons.module.css';
import MoreMenu from '../MoreMenu/MoreMenu';

/**
 * Reusable Action Buttons for table rows.
 * Supports legacy Edit/Delete mode and new SaaS-style View Ledger + MoreMenu mode.
 *
 * Legacy usage: <ActionButtons onEdit={...} onDelete={...} />
 * New usage:    <ActionButtons onViewLedger={...} menuItems={[...]} />
 *
 * @param {function} [onEdit]        - Edit click handler (legacy)
 * @param {function} [onDelete]      - Delete click handler (legacy)
 * @param {function} [onViewLedger]  - "View Ledger" primary action
 * @param {Array}    [menuItems]     - Items for the three-dot MoreMenu
 */
export default function ActionButtons({ onEdit, onDelete, onViewLedger, menuItems }) {
  const hasNewMode = onViewLedger || (menuItems && menuItems.length > 0);

  if (hasNewMode) {
    return (
      <div className={styles.actions}>
        {onViewLedger && (
          <button
            className={`${styles.btn} ${styles.viewLedger}`}
            onClick={(e) => { e.stopPropagation(); onViewLedger(); }}
          >
            View Ledger
          </button>
        )}
        {menuItems && menuItems.length > 0 && (
          <MoreMenu items={menuItems} />
        )}
      </div>
    );
  }

  // Legacy mode: Edit + Delete buttons
  return (
    <div className={styles.actions}>
      {onEdit && (
        <button className={`${styles.btn} ${styles.edit}`} onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button className={`${styles.btn} ${styles.delete}`} onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  );
}
