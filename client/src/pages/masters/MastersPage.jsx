import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useMastersStore } from '../../store/useMastersStore';
import { usePartyQuery } from '../../hooks/usePartyQuery';
import { usePartyMutations } from '../../hooks/usePartyMutations';
import { ENTITY_CONFIG, getConfigByTab } from '../../config/entityConfig';
import { getEntityColumns } from '../../config/entityColumns';
import {
  Page,
  Button,
  SearchBar,
  SummaryCard,
  DataTable,
  ActionButtons,
  CreateEditModal,
  ConfirmDeleteModal,
  PageHeader,
  HeaderFilters,
  Pagination,
} from '../../components';
import styles from './MastersPage.module.css';

/* ─── TABS (add new entity types here to extend the tab bar) ─── */
const TABS = Object.values(ENTITY_CONFIG).map((c) => ({
  id: c.tabId,
  label: c.label,
}));

/* ─── MAIN COMPONENT ─── */
export default function MastersPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // All grid context lives in Zustand — persists across page navigation
  const {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    isModalOpen, editId, formValues,
    openCreateModal, openEditModal, closeModal, handleFieldChange,
  } = useMastersStore();

  // Sync active tab when returning from AddPage / EditPage
  useEffect(() => {
    const returnedTab = location.state?.activeTab;
    if (returnedTab) setActiveTab(returnedTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Debounced search — derived, not stored
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const LIMIT = 10;

  // Resolve entity config from current active tab
  const config = getConfigByTab(activeTab);
  const recordType = config.apiKey;
  const entityLabel = config.label;
  const summaryLabels = config.summary;

  // Data & mutations — fully generic, driven by recordType
  const { data, loading, summary, summaryLoading, pagination } = usePartyQuery({
    recordType,
    page: currentPage,
    limit: LIMIT,
    search: debouncedSearch,
  });

  const { addParty, updateParty, deleteParty, isSaving } = usePartyMutations();

  // Handlers
  const handleSave = useCallback(async () => {
    if (editId) {
      await updateParty(editId, formValues);
    } else {
      await addParty({ ...formValues, recordType });
    }
  }, [editId, formValues, recordType, addParty, updateParty]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleViewLedger = useCallback((row) => {
    navigate(`/ledger/${activeTab}/${row._id || row.id}`);
  }, [activeTab, navigate]);

  const handleDeleteRequest = useCallback((row) => {
    setDeleteTarget({ id: row._id || row.id, name: row.name });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteParty(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteParty]);

  // Build columns from config — entityColumns.jsx handles all JSX renderers
  const columns = getEntityColumns(recordType, {
    styles,
    ActionButtons,
    onEdit: (row) => openEditModal(row, recordType),
    onViewLedger: handleViewLedger,
    onDeleteRequest: handleDeleteRequest,
  });

  return (
    <Page title="" subtitle="" loading={false} actions={null}>
      <Toaster position="top-right" />

      {/* ─── PAGE HEADER & TAB FILTERS ─── */}
      <PageHeader
        title={config.pluralLabel}
        subtitle={`Manage ${entityLabel.toLowerCase()} accounts and payments`}
        right={
          <HeaderFilters
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        }
      />

      {/* ─── SUMMARY CARDS (driven by config labels) ─── */}
      <div className={styles.summaryScroll}>
        <section className={styles.summaryGrid}>
          <SummaryCard
            label={summaryLabels.total}
            value={summaryLoading ? '…' : summary.totalCount}
          />
          <SummaryCard
            label={summaryLabels.sales}
            value={summaryLoading ? '…' : `₹${(summary.totalSalesOrPurchase || 0).toLocaleString('en-IN')}`}
            color="blue"
          />
          <SummaryCard
            label={summaryLabels.payment}
            value={summaryLoading ? '…' : `₹${(summary.totalPayment || 0).toLocaleString('en-IN')}`}
            color="green"
          />
          <SummaryCard
            label={summaryLabels.outstanding}
            value={summaryLoading ? '…' : `₹${Math.abs(summary.totalOutstanding || 0).toLocaleString('en-IN')}`}
            color={(summary.totalOutstanding || 0) <= 0 ? 'green' : 'red'}
          />
        </section>
      </div>

      {/* ─── SEARCH + ADD BUTTON ─── */}
      <div className={styles.searchActionBar}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${entityLabel.toLowerCase()} name or phone…`}
        />
        <Button
          onClick={() => navigate('/masters/add', { state: { defaultTab: recordType } })}
          icon="＋"
        >
          Add {entityLabel}
        </Button>
      </div>

      {/* ─── DATA TABLE (columns from config) ─── */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyTitle={searchQuery ? 'No matches found' : `No ${entityLabel.toLowerCase()}s yet`}
        emptyDescription={
          searchQuery
            ? 'Try a different name or phone number.'
            : `Create your first ${entityLabel.toLowerCase()} to get started.`
        }
      />

      {/* ─── PAGINATION ─── */}
      {!loading && pagination?.pageCount > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.pageCount}
          onPageChange={setCurrentPage}
          onNext={() => setCurrentPage(Math.min(pagination.pageCount, currentPage + 1))}
          onPrev={() => setCurrentPage(Math.max(1, currentPage - 1))}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          startIndex={(pagination.currentPage - 1) * LIMIT}
          endIndex={Math.min(pagination.currentPage * LIMIT, pagination.itemCount)}
          totalItems={pagination.itemCount}
        />
      )}

      {/* ─── CREATE / EDIT MODAL (fields from config) ─── */}
      <CreateEditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`${editId ? 'Edit' : 'Add'} ${entityLabel}`}
        fields={config.fields}
        values={formValues}
        onChange={handleFieldChange}
        onSubmit={handleSave}
        saving={isSaving}
      />

      {/* ─── DELETE CONFIRMATION ─── */}
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
