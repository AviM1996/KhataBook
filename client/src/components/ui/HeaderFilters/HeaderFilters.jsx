import React from 'react';
import Tabs from '../Tabs/Tabs';
import TimeFilter from '../TimeFilter/TimeFilter';
import styles from './HeaderFilters.module.css';

/**
 * Reusable HeaderFilters Component
 * Combines the segmented Tabs and TimeFilter into a unified, responsive wrapper
 * that can be dropped into the right or left slot of a PageHeader.
 * 
 * @param {Array<{id: string, label: string}>} tabs - Configuration of Tab options
 * @param {string} activeTab - The currently selected tab ID
 * @param {function} onTabChange - Callback triggered when a tab is clicked
 * @param {string} [activeTime] - Currently active time filter ID
 * @param {function} [onTimeChange] - Callback with selected time filter ID
 * @param {boolean} [hideTimeFilter] - If true, the time filter is hidden
 */
export default function HeaderFilters({ 
  tabs, 
  activeTab, 
  onTabChange, 
  activeTime, 
  onTimeChange,
  hideTimeFilter = false
}) {
  return (
    <div className={styles.filtersWrapper}>
      {tabs && tabs.length > 0 && (
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={onTabChange} 
        />
      )}
      
      {!hideTimeFilter && onTimeChange && (
        <TimeFilter 
          active={activeTime} 
          onChange={onTimeChange} 
        />
      )}
    </div>
  );
}
