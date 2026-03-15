import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import {
  Page,
  SummaryCard,
  TimeFilter,
} from '../../components';
import SalesPaymentChart from '../../components/ui/SalesPaymentChart/SalesPaymentChart';
import CustomerRetentionChart from '../../components/ui/CustomerRetentionChart/CustomerRetentionChart';
import AccountsAgingChart from '../../components/ui/AccountsAgingChart/AccountsAgingChart';
import RecentTransactionsTable from '../../components/ui/RecentTransactionsTable/RecentTransactionsTable';
import DrilldownModal, { DrilldownTable } from '../../components/ui/DrilldownModal/DrilldownModal';

const TIME_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

// ─── Mock drill-down data generators ───
const generateSalesDrilldown = (point) => ({
  columns: ['Party', 'Type', 'Amount', 'Time'],
  rows: [
    [point.label, 'Sale', `₹${(point.sales * 0.35).toLocaleString('en-IN')}`, '10:30 AM'],
    ['Sharma Electronics', 'Sale', `₹${(point.sales * 0.25).toLocaleString('en-IN')}`, '11:15 AM'],
    ['ABC Traders', 'Payment', `₹${(point.payment * 0.5).toLocaleString('en-IN')}`, '12:00 PM'],
    ['Gupta & Sons', 'Sale', `₹${(point.sales * 0.2).toLocaleString('en-IN')}`, '2:30 PM'],
    ['Patel Distributors', 'Payment', `₹${(point.payment * 0.3).toLocaleString('en-IN')}`, '3:45 PM'],
    ['Kumar Store', 'Sale', `₹${(point.sales * 0.2).toLocaleString('en-IN')}`, '5:00 PM'],
  ],
});

const generateRetentionDrilldown = (segment) => {
  if (segment.name.includes('Returning')) {
    return {
      columns: ['Customer', 'Total Orders', 'Last Purchase', 'Total Spent'],
      rows: [
        ['Avishek Maity', '12', '15 Mar 2026', '₹45,200'],
        ['Sharma Electronics', '8', '14 Mar 2026', '₹1,28,500'],
        ['Gupta & Sons', '15', '13 Mar 2026', '₹78,300'],
        ['Patel Distributors', '6', '12 Mar 2026', '₹2,15,000'],
        ['Kumar Store', '9', '11 Mar 2026', '₹56,800'],
        ['Singh Traders', '4', '10 Mar 2026', '₹32,100'],
      ],
    };
  }
  return {
    columns: ['Customer', 'First Purchase', 'Amount', 'Source'],
    rows: [
      ['Reddy Supplies', '14 Mar 2026', '₹8,500', 'Walk-in'],
      ['Jain Brothers', '13 Mar 2026', '₹12,000', 'Referral'],
      ['Metro Wholesale', '12 Mar 2026', '₹22,000', 'Online'],
      ['Dinesh Mart', '11 Mar 2026', '₹5,400', 'Walk-in'],
    ],
  };
};

const generateAgingDrilldown = (entry, type) => ({
  columns: ['Customer', 'Invoice #', 'Days Outstanding', 'Amount Due'],
  rows: entry.bucket.includes('0–30')
    ? [
      ['Avishek Maity', 'INV-1042', '5', '₹5,200'],
      ['Sharma Electronics', 'INV-1038', '12', '₹4,800'],
      ['Kumar Store', 'INV-1035', '22', '₹3,500'],
      ['Gupta & Sons', 'INV-1030', '28', '₹5,000'],
    ]
    : entry.bucket.includes('31–60')
      ? [
        ['Patel Distributors', 'INV-1020', '35', '₹4,200'],
        ['Singh Traders', 'INV-1015', '42', '₹3,800'],
        ['Metro Wholesale', 'INV-1010', '55', '₹4,000'],
      ]
      : entry.bucket.includes('61–90')
        ? [
          ['Reddy Supplies', 'INV-0998', '68', '₹4,500'],
          ['Jain Brothers', 'INV-0985', '82', '₹3,700'],
        ]
        : [
          ['Dinesh Mart', 'INV-0950', '105', '₹3,200'],
          ['Lakshmi Stores', 'INV-0920', '128', '₹4,500'],
          ['Old Town Traders', 'INV-0890', '145', '₹2,350'],
        ],
});

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    timeFilter,
    setTimeFilter,
    summaryCards,
    salesPayment,
    customerRetention,
    receivableAging,
    payableAging,
    recentTransactions,
  } = useDashboardStats();

  // ─── Drilldown Modal State ───
  const [drilldown, setDrilldown] = useState({ open: false, title: '', subtitle: '', content: null });
  const closeDrilldown = useCallback(() => setDrilldown((d) => ({ ...d, open: false })), []);

  // ─── Refs for scroll-to-chart ───
  const salesChartRef = useRef(null);
  const agingChartRef = useRef(null);

  // ─── Card click handlers ───
  const cardActions = [
    () => navigate('/masters?tab=customers'),                     // Total Customers
    () => navigate('/masters?tab=suppliers'),                      // Total Suppliers
    () => navigate('/masters?tab=customers&filter=overdue90'),     // 90+ Days Due
    () => {                                                        // Sales
      salesChartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      navigate('/transactions?type=DEBIT');
    },
    () => navigate('/transactions?type=CREDIT'),                   // Payments Received
    () => {                                                        // Outstanding
      agingChartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  ];

  // ─── Chart click handlers ───
  const handleSalesPointClick = (point) => {
    const data = generateSalesDrilldown(point);
    setDrilldown({
      open: true,
      title: `Transactions — ${point.label}`,
      subtitle: `Sales: ₹${point.sales.toLocaleString('en-IN')}  ·  Payments: ₹${point.payment.toLocaleString('en-IN')}`,
      content: <DrilldownTable columns={data.columns} rows={data.rows} />,
    });
  };

  const handleRetentionClick = (segment) => {
    const data = generateRetentionDrilldown(segment);
    setDrilldown({
      open: true,
      title: segment.name,
      subtitle: `${segment.value}% of total customers`,
      content: <DrilldownTable columns={data.columns} rows={data.rows} />,
    });
  };

  const handleAgingClick = (entry, type) => {
    const data = generateAgingDrilldown(entry, type);
    setDrilldown({
      open: true,
      title: `${type} — ${entry.bucket}`,
      subtitle: `Outstanding: ₹${entry.amount.toLocaleString('en-IN')}`,
      content: <DrilldownTable columns={data.columns} rows={data.rows} />,
    });
  };

  const handleTransactionClick = (tx) => {
    setDrilldown({
      open: true,
      title: `${tx.type} — ${tx.party}`,
      subtitle: tx.date,
      content: (
        <div className={styles.txDetail}>
          <div className={styles.txDetailRow}>
            <span className={styles.txDetailLabel}>Party</span>
            <span className={styles.txDetailValue}>{tx.party}</span>
          </div>
          <div className={styles.txDetailRow}>
            <span className={styles.txDetailLabel}>Transaction Type</span>
            <span className={`${styles.txDetailBadge} ${styles[`txBadge${tx.type}`]}`}>{tx.type}</span>
          </div>
          <div className={styles.txDetailRow}>
            <span className={styles.txDetailLabel}>Amount</span>
            <span className={styles.txDetailAmount}>₹{tx.amount.toLocaleString('en-IN')}</span>
          </div>
          <div className={styles.txDetailRow}>
            <span className={styles.txDetailLabel}>Date</span>
            <span className={styles.txDetailValue}>{tx.date}</span>
          </div>
          <div className={styles.txDetailRow}>
            <span className={styles.txDetailLabel}>Invoice</span>
            <span className={styles.txDetailValue}>INV-{1000 + Math.floor(Math.random() * 100)}</span>
          </div>
          <div className={styles.txDetailRow}>
            <span className={styles.txDetailLabel}>Status</span>
            <span className={styles.txDetailStatus}>Completed</span>
          </div>
          <button
            className={styles.txDetailBtn}
            onClick={() => navigate('/ledger')}
          >
            Open in Ledger →
          </button>
        </div>
      ),
    });
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.subtitle}>Your business at a glance</p>
        </div>

        <TimeFilter
          options={TIME_OPTIONS}
          active={timeFilter}
          onChange={setTimeFilter}
        />
      </div>
      <div className={styles.cardsScroll}>
        <div className={styles.cardsGrid}>
          {summaryCards.map((card, i) => (
            <SummaryCard
              key={i}
              label={card.label}
              value={card.value}
              color={card.color}
              growth={card.growth}
              growthLabel={card.growthLabel}
              onClick={cardActions[i]}
            />
          ))}
        </div>
      </div>
      <div className={styles.chartsRow} ref={salesChartRef}>
        <div className={styles.chartCard}>
          <SalesPaymentChart data={salesPayment} onPointClick={handleSalesPointClick} />
        </div>
        <div className={`${styles.chartCard} ${styles.chartCardSmall}`}>
          <CustomerRetentionChart data={customerRetention} onSegmentClick={handleRetentionClick} />
        </div>
      </div>

      <div className={styles.chartsRow} ref={agingChartRef}>
        <div className={styles.chartCard}>
          <AccountsAgingChart
            title="Customer Due"
            data={receivableAging}
            onBarClick={(entry) => handleAgingClick(entry, 'Receivable')}
          />
        </div>
        <div className={styles.chartCard}>
          <AccountsAgingChart
            title="Supplier Due"
            data={payableAging}
            onBarClick={(entry) => handleAgingClick(entry, 'Payable')}
          />
        </div>
      </div>
      <div className={styles.tableCard}>
        <RecentTransactionsTable data={recentTransactions} onRowClick={handleTransactionClick} />
      </div>

      <DrilldownModal
        open={drilldown.open}
        onClose={closeDrilldown}
        title={drilldown.title}
        subtitle={drilldown.subtitle}
      >
        {drilldown.content}
      </DrilldownModal>
    </div>

  );
}