import React from 'react';
import { AvatarHeader } from '../../components';
import TransactionTimeline from './TransactionTimeline';
import TransactionForm from './TransactionForm';
import styles from './LedgerPanel.module.css';

export default React.memo(function LedgerPanel({
  entity,
  activeTab,
  transactions,
  loading,
  onBack,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
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
      <AvatarHeader
        title={entity.name}
        subtitleLeft={entity.phone ? `☎ ${entity.phone}` : null}
        subtitleRight={entity.address}
        avatarText={(entity.name || '?').charAt(0).toUpperCase()}
        stats={entity ? (
          activeTab === 'customer' ? [
            { label: 'Sales', value: '₹' + Number(entity.totalSales || 0).toLocaleString('en-IN') },
            { label: 'Received', value: '₹' + Number(entity.totalPayment || 0).toLocaleString('en-IN') },
            { label: 'Outstanding', value: '₹' + Number(Math.abs(entity.outstanding || 0)).toLocaleString('en-IN') }
          ] : [
            { label: 'Purchase', value: '₹' + Number(entity.totalPurchase || 0).toLocaleString('en-IN') },
            { label: 'Paid', value: '₹' + Number(entity.totalPayment || 0).toLocaleString('en-IN') },
            { label: 'Outstanding', value: '₹' + Number(Math.abs(entity.outstanding || 0)).toLocaleString('en-IN') }
          ]
        ) : null}
        onBack={onBack}
      />

      <TransactionTimeline
        transactions={transactions}
        loading={loading}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
      />

      <TransactionForm
        activeTab={activeTab}
        onAdd={onAddTransaction}
      />
    </div>
  );
});
