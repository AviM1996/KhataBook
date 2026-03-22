import React, { memo } from 'react';
import { ContactCard, Tabs, LoaderInline } from '../..';
import styles from './EntityPanel.module.css';

/* ─── Dynamic Stats Builder ─── */
const buildStats = (stats, activeTab, styles) => {
  if (!stats) return null;

  // CUSTOMER
  if (activeTab === 'customer') {
    return [
      {
        label: 'Sales',
        value: `₹${Number(stats.totalSales || 0).toLocaleString('en-IN')}`
      },
      {
        label: 'Rcvd',
        value: `₹${Number(stats.totalPayment || 0).toLocaleString('en-IN')}`
      },
      {
        label: 'Due',
        value: `₹${Number(stats.outstanding || 0).toLocaleString('en-IN')}`,
        className: styles.outstandingDue
      }
    ];
  }

  // SUPPLIER
  return [
    {
      label: 'Purchase',
      value: `₹${Number(stats.totalPurchase || 0).toLocaleString('en-IN')}`
    },
    {
      label: 'Paid',
      value: `₹${Number(stats.totalPayment || 0).toLocaleString('en-IN')}`
    },
    {
      label: 'Due',
      value: `₹${Number(stats.outstanding || 0).toLocaleString('en-IN')}`,
      className: styles.outstandingDue
    }
  ];
};

/* ─── Component ─── */
export default memo(function EntityPanel({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  isLoading,
  entities,
  selectedEntityId,
  onSelect,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      <div className={styles.header}>
        <Tabs 
          tabs={[
            { id: 'customer', label: 'Customers' },
            { id: 'supplier', label: 'Suppliers' }
          ]}
          activeTab={activeTab}
          onChange={onTabChange}
          fullWidth
        />

        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={`Search ${activeTab}s…`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.emptyMsg}>
            <LoaderInline size="sm" />
            <span style={{ marginLeft: 8 }}>
              Loading {activeTab}s...
            </span>
          </div>
        ) : entities.length === 0 ? (
          <div className={styles.emptyMsg}>
            {search ? 'No results found' : `No ${activeTab}s yet`}
          </div>
        ) : (
          entities.map((entity) => {
            const id = entity.id || entity._id;
            const lastTxDate = entity.lastTxDate || null;

            return (
              <ContactCard
                key={id}
                initial={(entity.name || '?').charAt(0).toUpperCase()}
                name={entity.name}
                phone={entity.phone}
                dateLabel={
                  lastTxDate
                    ? new Date(lastTxDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })
                    : ''
                }
                stats={buildStats(entity, activeTab, styles)} // ✅ dynamic stats from API directly
                isActive={selectedEntityId === id}
                onClick={() => onSelect(id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
});