import React, { memo, useRef, useState, useLayoutEffect } from 'react';
import { ContactCard, Tabs, LoaderInline, SearchInput } from '../..';
import { List } from 'react-window';
import styles from './EntityPanel.module.css';

const TABS_CONFIG = [
  { id: 'customer', label: 'Customers' },
  { id: 'supplier', label: 'Suppliers' }
];

function formatDateLabel(date) {
  const d = new Date(date);
  const today = new Date();

  const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;

  return d.toLocaleDateString('en-IN');
}

const RowComponent = memo(({ index, style, entities, activeTab, selectedEntityId, onSelect }) => {
  const entity = entities[index];
  const id = entity.id || entity._id;
  const lastTxnDate = entity.lastTxnDate || entity.lastTxDate || null;

  return (
    <div style={{ ...style, overflow: 'hidden' }}>
      <ContactCard
        id={id}
        initial={(entity.name || '?').charAt(0).toUpperCase()}
        name={entity.name}
        phone={entity.phone}
        dateLabel={lastTxnDate ? formatDateLabel(lastTxnDate) : ''}
        activeTab={activeTab}
        outstanding={entity.outstanding}
        isActive={selectedEntityId === id}
        onClick={onSelect}
      />
    </div>
  );
});

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
  const listRef = useRef(null);
  const [listHeight, setListHeight] = useState(0);

  useLayoutEffect(() => {
    if (!listRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setListHeight(entries[0].contentRect.height);
    });
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      <div className={styles.header}>
        <Tabs
          tabs={TABS_CONFIG}
          activeTab={activeTab}
          onChange={onTabChange}
          fullWidth
        />

        <div className={styles.searchWrap}>
          <SearchInput
            value={search || ''}
            placeholder={`Search ${activeTab}s…`}
            onChange={(val) => onSearchChange(val)}
            onClear={() => onSearchChange('')}
          />
        </div>
      </div>

      <div className={styles.list} ref={listRef} style={{ flex: 1, minHeight: 0 }}>
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
          <List
            height={listHeight || 400}
            width="100%"
            rowCount={entities.length}
            rowHeight={82}
            rowComponent={RowComponent}
            rowProps={{
              entities,
              activeTab,
              selectedEntityId,
              onSelect
            }}
          />
        )}
      </div>
    </div>
  );
});