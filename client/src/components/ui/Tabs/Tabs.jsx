import React from 'react';
import styles from './Tabs.module.css';

/**
 * Reusable Segmented Tabs Component
 * @param {Array<{id: string, label: string}>} tabs - Configuration of Tab options
 * @param {string} activeTab - The currently selected tab ID
 * @param {function} onChange - Callback triggered when a tab is clicked, passed the tab ID
 */
export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
