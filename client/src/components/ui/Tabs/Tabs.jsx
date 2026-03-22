import React from 'react';
import styles from './Tabs.module.css';


export default function Tabs({ tabs, activeTab, onChange, fullWidth = false, size = 'md' }) {
  return (
    <div className={`${styles.tabs} ${fullWidth ? styles.fullWidth : ''} ${styles[`size-${size}`] || ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabBtn} ${fullWidth ? styles.fullWidthBtn : ''} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
