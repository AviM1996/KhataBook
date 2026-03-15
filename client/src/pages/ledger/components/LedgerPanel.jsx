import React from 'react';
import LedgerHeader from './LedgerHeader';
import TransactionTimeline from './TransactionTimeline';
import TransactionForm from './TransactionForm';
import styles from './LedgerPanel.module.css';

export default function LedgerPanel({
  entity,
  activeTab,
  stats,
  transactions,
  loading,
  onBack,
  onAddTransaction,
}) {
  if (!entity) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>💬</span>
          <span className={styles.emptyText}>
            Select a {activeTab === 'customer' ? 'customer' : 'supplier'} to view their ledger
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <LedgerHeader
        entity={entity}
        activeTab={activeTab}
        stats={stats}
        onBack={onBack}
      />

      <TransactionTimeline
        transactions={transactions}
        loading={loading}
      />

      <TransactionForm
        activeTab={activeTab}
        onAdd={onAddTransaction}
      />
    </div>
  );
}
