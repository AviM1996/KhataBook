import React, { useRef, useEffect } from 'react';
import TransactionBubble from './TransactionBubble';
import styles from './TransactionTimeline.module.css';

function groupByDate(transactions) {
  const groups = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    if (!groups[d]) groups[d] = [];
    groups[d].push(tx);
  });
  return groups;
}

export default function TransactionTimeline({ transactions, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transactions]);

  if (loading) {
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

  const groups = groupByDate(transactions);

  return (
    <div className={styles.timeline}>
      {Object.entries(groups).map(([date, txs]) => (
        <React.Fragment key={date}>
          <div className={styles.dateSeparator}>
            <span>{date}</span>
          </div>
          {txs.map((tx) => (
            <TransactionBubble key={tx.id || tx._id} tx={tx} />
          ))}
        </React.Fragment>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
