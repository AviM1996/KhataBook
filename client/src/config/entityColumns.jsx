/**
 * entityColumns.jsx  — JSX column renderer factory
 * Each entity gets columns via getEntityColumns(entityType, helpers)
 * helpers = { styles, ActionButtons, onEdit, onViewLedger, onDeleteRequest }
 */
import React from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { formatCurrency } from './entityConfig';

const formatLastTxn = (row) => {
  if (!row.lastTxnDate && !row.lastTxnAmount) return '—';
  const date = row.lastTxnDate
    ? new Date(row.lastTxnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : '—';
  const amt = row.lastTxnAmount != null
    ? ` (₹${Math.abs(row.lastTxnAmount).toLocaleString('en-IN')})`
    : '';
  return `${date}${amt}`;
};

export function getEntityColumns(entityType, { styles, ActionButtons, onEdit, onViewLedger, onDeleteRequest }) {
  const isCustomer = entityType === 'CUSTOMER';

  return [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className={styles.nameCell}>
          <span className={styles.avatar}>{(row.name || '?').charAt(0).toUpperCase()}</span>
          <div>
            <span className={styles.boldText}>{row.name || '—'}</span>
            {row.address && <span className={styles.addressText}>{row.address}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => <span className={styles.phoneText}>{row.phone || '—'}</span>,
    },
    {
      key: 'salesOrPurchase',
      label: isCustomer ? 'Total Goods Sales' : 'Total Goods Purchase',
      align: 'right',
      render: (row) => {
        const val = isCustomer ? (row.totalSales || 0) : (row.totalPurchase || 0);
        return <span className={`${styles.badge} ${styles.badgeBlue}`}>{formatCurrency(val)}</span>;
      },
    },
    {
      key: 'totalPayment',
      label: isCustomer ? 'Payment Received' : 'Payment Made',
      align: 'right',
      render: (row) => (
        <span className={`${styles.badge} ${styles.badgeGreen}`}>
          {formatCurrency(row.totalPayment || 0)}
        </span>
      ),
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      align: 'right',
      render: (row) => {
        const val = row.outstanding || 0;
        return (
          <span className={`${styles.badge} ${val > 0 ? styles.badgeRed : styles.badgeGreen}`}>
            {formatCurrency(val)}
          </span>
        );
      },
    },
    {
      key: 'lastTxn',
      label: 'Last Transaction',
      render: (row) => <span className={styles.dimText}>{formatLastTxn(row)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <ActionButtons
          onViewLedger={() => onViewLedger(row)}
          menuItems={[
            { label: 'Edit',   icon: <MdEdit />, onClick: () => onEdit(row) },
            { divider: true },
            { label: 'Delete', icon: <MdDelete />, onClick: () => onDeleteRequest(row), danger: true },
          ]}
        />
      ),
    },
  ];
}
