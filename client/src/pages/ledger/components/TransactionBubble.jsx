import React from 'react';
import styles from './TransactionBubble.module.css';

const ALIGN = {
  SALE: 'right',
  PURCHASE: 'right',
  PAYMENT: 'left',
  RETURN: 'center',
};

const TYPE_LABEL = {
  SALE: 'Sale',
  PURCHASE: 'Purchase',
  PAYMENT: 'Payment',
  RETURN: 'Return',
};

export default function TransactionBubble({ tx }) {
  const align = ALIGN[tx.type] || 'left';
  const label = TYPE_LABEL[tx.type] || tx.type;
  const date = new Date(tx.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = new Date(tx.date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${styles.bubble} ${styles[align]}`}>
      <div className={styles.card}>
        <div className={styles.typeRow}>
          <span className={styles.typeBadge}>{label}</span>
        </div>

        <div className={styles.amount}>
          ₹{Number(tx.amount).toLocaleString('en-IN')}
        </div>

        <div className={styles.meta}>
          {tx.paymentMethod && tx.paymentMethod !== 'N/A' && (
            <span>via {tx.paymentMethod}</span>
          )}
        </div>

        {(tx.note || tx.description) && (
          <div className={styles.note}>{tx.note || tx.description}</div>
        )}

        <span className={styles.timestamp}>{date} · {time}</span>
      </div>
    </div>
  );
}
