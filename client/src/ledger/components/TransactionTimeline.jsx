import React from 'react';
import { TimelineBubble } from '../../components';
import { usePagination } from '../../hooks/usePagination';
import styles from './TransactionTimeline.module.css';

export default function TransactionTimeline({ transactions, loading, onEdit, onDelete }) {
  const { infiniteItems, observerTarget } = usePagination(transactions, 5); // 5 groups per page

  if (loading && (!transactions || transactions.length === 0)) {
    return <div className={styles.loading}>Loading transactions…</div>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📋</span>
        <span>No transactions yet. Add one below!</span>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {infiniteItems.map((group) => (
        <React.Fragment key={group._id}>
          {group.transactions.map((tx) => {
            const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            });
            const timeStr = new Date(tx.date).toLocaleTimeString('en-IN', {
              hour: '2-digit', minute: '2-digit',
            });

            return (
              <TimelineBubble 
                key={tx.id || tx._id} 
                align={tx.align}
                type={tx.colorType}
                badgeText={tx.label}
                amount={`₹${Number(tx.amount).toLocaleString('en-IN')}`}
                metaText={tx.paymentMethod && tx.paymentMethod !== 'N/A' ? `via ${tx.paymentMethod}` : null}
                noteText={tx.note}
                timestamp={`${dateStr} · ${timeStr}`}
                onEdit={onEdit ? () => onEdit(tx) : undefined}
                onDelete={onDelete ? () => onDelete(tx) : undefined}
              />
            );
          })}
          <div className={styles.dateSeparator}>
            <span>{group._id}</span>
          </div>
        </React.Fragment>
      ))}
      <div ref={observerTarget} style={{ height: '20px', flexShrink: 0 }} />
    </div>
  );
}
