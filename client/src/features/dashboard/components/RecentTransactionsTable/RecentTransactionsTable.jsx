import React from 'react';
import styles from './RecentTransactionsTable.module.css';

const TYPE_STYLE = {
  Sale: 'sale',
  Payment: 'payment',
  Purchase: 'purchase',
};

/**
 * RecentTransactionsTable – clean table showing recent party transactions
 * @param {Array} data - Array of { party, type, amount, date }
 * @param {function} [onRowClick] - Called with the transaction object when a row is clicked
 */
export default function RecentTransactionsTable({ data = [], onRowClick }) {
  if (!data.length) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent Transactions</h3>
        </div>
        <div className={styles.empty}>No transactions yet</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Transactions</h3>
        <span className={styles.count}>{data.length} entries</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Party</th>
              <th>Type</th>
              <th className={styles.alignRight}>Amount</th>
              <th className={styles.alignRight}>Date</th>
              {onRowClick && <th className={styles.alignRight}></th>}
            </tr>
          </thead>
          <tbody>
            {data.map((tx, i) => (
              <tr
                key={i}
                className={`${styles.row} ${onRowClick ? styles.rowClickable : ''}`}
                onClick={() => onRowClick?.(tx)}
              >
                <td className={styles.partyCell}>
                  <span className={styles.avatar}>
                    {tx.party.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.partyName}>{tx.party}</span>
                </td>
                <td>
                  <span className={`${styles.typeBadge} ${styles[TYPE_STYLE[tx.type]] || ''}`}>
                    {tx.type}
                  </span>
                </td>
                <td className={`${styles.amount} ${styles.alignRight}`}>
                  ₹{tx.amount.toLocaleString('en-IN')}
                </td>
                <td className={`${styles.date} ${styles.alignRight}`}>{tx.date}</td>
                {onRowClick && (
                  <td className={`${styles.arrowCell} ${styles.alignRight}`}>
                    <span className={styles.rowArrow}>→</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
