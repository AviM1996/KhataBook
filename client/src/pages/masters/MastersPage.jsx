import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useMasters } from '../../hooks/useMasters';
import {
  Page,
  Button,
  Tabs,
  SearchBar,
  TimeFilter,
  SummaryCard,
  DataTable,
  ActionButtons,
  CreateEditModal,
  MoreMenu,
  ConfirmDeleteModal,
  PageHeader,
  HeaderFilters,
} from '../../components';
import styles from './MastersPage.module.css';

/* ─── FORM FIELD CONFIGS ─── */
const CUSTOMER_FIELDS = [
  { name: 'name',             label: 'Name',              type: 'text',   required: true },
  { name: 'phone',            label: 'Phone',             type: 'text',   required: true },
  { name: 'address',          label: 'Address',           type: 'text' },
  { name: 'openingBalance',   label: 'Opening Balance',   type: 'number' },
  {
    name: 'balanceDirection', label: 'Balance Direction', type: 'select',
    options: [
      { value: 'Receivable', label: 'Receivable (To Collect)' },
      { value: 'Payable',    label: 'Payable (To Give)' },
    ],
  },
];

const SUPPLIER_FIELDS = [
  { name: 'name',             label: 'Name',              type: 'text',   required: true },
  { name: 'phone',            label: 'Phone',             type: 'text',   required: true },
  { name: 'address',          label: 'Address',           type: 'text' },
  { name: 'openingBalance',   label: 'Opening Balance',   type: 'number' },
  {
    name: 'balanceDirection', label: 'Balance Direction', type: 'select',
    options: [
      { value: 'Payable',    label: 'Payable (To Give)' },
      { value: 'Receivable', label: 'Receivable (To Collect)' },
    ],
  },
];

/* ─── HELPERS ─── */
function formatCurrency(val) {
  return `₹${Math.abs(val || 0).toLocaleString('en-IN')}`;
}

function formatLastTx(row) {
  if (!row.lastTransactionDate && !row.lastTransactionAmount) return <span className={styles.dimText}>—</span>;
  const date = row.lastTransactionDate
    ? new Date(row.lastTransactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : '—';
  const amt = row.lastTransactionAmount != null
    ? ` (₹${Math.abs(row.lastTransactionAmount).toLocaleString('en-IN')})`
    : '';
  return <span className={styles.lastTx}>{date}{amt}</span>;
}

/* ─── TABLE COLUMN FACTORY ─── */
const getColumns = (type, onEdit, onViewLedger, onDeleteRequest) => [
  {
    key: 'name',
    label: 'Customer Name',
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
    key: 'totalSales',
    label: type === 'customer' ? 'Total Sales' : 'Total Purchase',
    align: 'right',
    render: (row) => {
      const val = type === 'customer'
        ? Math.abs(row.totalDebit || 0)
        : Math.abs(row.totalCredit || 0);
      return <span className={`${styles.badge} ${styles.badgeBlue}`}>{formatCurrency(val)}</span>;
    },
  },
  {
    key: 'totalPaid',
    label: 'Total Paid',
    align: 'right',
    render: (row) => {
      const val = type === 'customer'
        ? Math.abs(row.totalCredit || 0)
        : Math.abs(row.totalDebit || 0);
      return <span className={`${styles.badge} ${styles.badgeGreen}`}>{formatCurrency(val)}</span>;
    },
  },
  {
    key: 'outstanding',
    label: 'Total Due',
    align: 'right',
    render: (row) => {
      const val = row.outstandingBalance || 0;
      const isDue = val > 0;
      return (
        <span className={`${styles.badge} ${isDue ? styles.badgeRed : styles.badgeGreen}`}>
          {formatCurrency(val)}
        </span>
      );
    },
  },
  {
    key: 'lastTransaction',
    label: 'Last Transaction',
    render: (row) => formatLastTx(row),
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'center',
    render: (row) => (
      <ActionButtons
        onViewLedger={() => onViewLedger(row)}
        menuItems={[
          { label: 'Edit',   icon: '✏️', onClick: () => onEdit(row) },
          { divider: true },
          { label: 'Delete', icon: '🗑️', onClick: () => onDeleteRequest(row), danger: true },
        ]}
      />
    ),
  },
];

/* ─── MAIN COMPONENT ─── */
export default function MastersPage() {
  const navigate = useNavigate();

  const {
    activeTab, setActiveTab,
    loading, filteredData,
    searchQuery, setSearchQuery,
    timePeriod, setTimePeriod,
    summaryStats, growthData,
    isModalOpen, editId, formValues, saving,
    openCreateModal, openEditModal, closeModal,
    handleFieldChange, handleSave, handleDelete,
  } = useMasters();

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  const isCustomer = activeTab === 'customer';
  const entityLabel = isCustomer ? 'Customer' : 'Supplier';

  /* handlers */
  const handleViewLedger = useCallback((row) => {
    const entityType = isCustomer ? 'customer' : 'supplier';
    navigate(`/ledger/${entityType}/${row.id || row._id}`);
  }, [isCustomer, navigate]);

  const handleDeleteRequest = useCallback((row) => {
    setDeleteTarget({ id: row.id || row._id, name: row.name });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await handleDelete(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, handleDelete]);

  const columns = getColumns(activeTab, openEditModal, handleViewLedger, handleDeleteRequest);
  const fields  = isCustomer ? CUSTOMER_FIELDS : SUPPLIER_FIELDS;

  return (
    <Page title="" subtitle="" loading={false} actions={null}>
      <Toaster position="top-right" />

      {/* ─── PAGE HEADER & FILTERS ─── */}
      <PageHeader
        title={entityLabel + 's'}
        subtitle={`Manage ${entityLabel.toLowerCase()} accounts and payments`}
        right={
          <HeaderFilters
            tabs={[
              { id: 'customer', label: 'Customer' },
              { id: 'supplier', label: 'Supplier' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeTime={timePeriod}
            onTimeChange={setTimePeriod}
          />
        }
      />

      {/* ─── SUMMARY CARDS ─── */}
      <div className={styles.summaryScroll}>
        <section className={styles.summaryGrid}>
          <SummaryCard
            label={isCustomer ? 'Total Customers' : 'Total Suppliers'}
            value={loading ? '…' : summaryStats.totalCount}
            growth={growthData.countGrowth.value}
            growthLabel={growthData.countGrowth.label}
          />
          <SummaryCard
            label={isCustomer ? 'Total Sales' : 'Total Purchase'}
            value={loading ? '…' : `₹${summaryStats.totalSalesOrPurchase.toLocaleString('en-IN')}`}
            color="blue"
            growth={growthData.salesGrowth.value}
            growthLabel={growthData.salesGrowth.label}
          />
          <SummaryCard
            label={isCustomer ? 'Total Received' : 'Total Paid'}
            value={loading ? '…' : `₹${summaryStats.totalPayment.toLocaleString('en-IN')}`}
            color="green"
            growth={growthData.paymentGrowth.value}
            growthLabel={growthData.paymentGrowth.label}
          />
          <SummaryCard
            label="Total Outstanding"
            value={loading ? '…' : `₹${Math.abs(summaryStats.totalOutstanding).toLocaleString('en-IN')}`}
            color={summaryStats.totalOutstanding <= 0 ? 'green' : 'red'}
            growth={growthData.outstandingGrowth.value}
            growthLabel={growthData.outstandingGrowth.label}
          />
        </section>
      </div>

      {/* ─── SEARCH + ACTION BAR ─── */}
      <div className={styles.searchActionBar}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${entityLabel.toLowerCase()} name or phone…`}
        />
        <Button onClick={openCreateModal} icon="＋">
          Add {entityLabel}
        </Button>
      </div>

      {/* ─── CUSTOMER / SUPPLIER TABLE ─── */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyTitle={searchQuery ? 'No matches found' : `No ${entityLabel.toLowerCase()}s yet`}
        emptyDescription={
          searchQuery
            ? 'Try a different name or phone number.'
            : `Create your first ${entityLabel.toLowerCase()} to get started.`
        }
      />

      {/* ─── CREATE / EDIT MODAL ─── */}
      <CreateEditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`${editId ? 'Edit' : 'Create'} ${entityLabel}`}
        fields={fields}
        values={formValues}
        onChange={handleFieldChange}
        onSubmit={handleSave}
        saving={saving}
      />

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        entityName={deleteTarget?.name}
        title={`Delete ${entityLabel}`}
      />
    </Page>
  );
}
