import React, { useState } from 'react';
import EntityListItem from './EntityListItem';
import styles from './EntityPanel.module.css';

export default function EntityPanel({
  activeTab,
  onTabChange,
  entities,
  selectedEntityId,
  onSelect,
  entityStats,
}) {
  const [search, setSearch] = useState('');

  const filtered = entities.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.phone?.includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ─── Header: Tabs + Search ─── */}
      <div className={styles.header}>
        <div className={styles.tabRow}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'customer' ? styles.active : ''}`}
            onClick={() => onTabChange('customer')}
          >
            Customers
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'supplier' ? styles.active : ''}`}
            onClick={() => onTabChange('supplier')}
          >
            Suppliers
          </button>
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={`Search ${activeTab}s…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── Entity List ─── */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.emptyMsg}>
            {search ? 'No results found' : `No ${activeTab}s yet`}
          </div>
        ) : (
          filtered.map((entity) => {
            const id = entity.id || entity._id;
            const stats = entityStats?.[id];
            const lastTxDate = stats?.lastTxDate || null;
            return (
              <EntityListItem
                key={id}
                entity={entity}
                isActive={selectedEntityId === id}
                stats={stats}
                lastTxDate={lastTxDate}
                onClick={() => onSelect(id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
