import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { getParties } from '../../api/party';
import { getPartyTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../api/transaction';
import { CreateEditModal, ConfirmDeleteModal } from '../../components';

import EntityPanel from '../../components/features/ledger/EntityPanel';
import LedgerPanel from '../../ledger/components/LedgerPanel';
import styles from './LedgerV2.module.css';

export default function UniversalLedgerPage() {
  const { entityType, entityId } = useParams();
  const navigate = useNavigate();

  const lockedType = entityType === 'supplier' ? 'supplier' : entityType === 'customer' ? 'customer' : null;

  const [activeTab, setActiveTab] = useState(lockedType || 'customer');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [entities, setEntities] = useState([]);
  const [isEntitiesLoading, setIsEntitiesLoading] = useState(false);

  const [selectedEntityId, setSelectedEntityId] = useState(entityId || '');
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState({}); 
  const [txLoading, setTxLoading] = useState(false);

  // Edit / Delete states
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);

  // Mobile: track which panel is visible
  const [mobileView, setMobileView] = useState(entityId ? 'right' : 'left');

  const entitiesCache = useRef({});
  const requestIdRef = useRef(0);
  const queryClient = useQueryClient();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ─── Fetch entities on tab change or search ───
  useEffect(() => {
    let isMounted = true;
    const currentRequestId = ++requestIdRef.current;

    const fetchEntities = async () => {
      const recordType = activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER';
      const cacheKey = `${recordType}_${debouncedSearch}`;

      if (entitiesCache.current[cacheKey]) {
        const cachedList = entitiesCache.current[cacheKey];

        if (!isMounted) return;

        setEntities(cachedList);

        if (!entityId && cachedList.length > 0) {
          setSelectedEntityId((prev) => prev || cachedList[0].id || cachedList[0]._id);
        }
        return;
      }

      setIsEntitiesLoading(true);

      try {
        const res = await getParties({ recordType, limit: 1000, search: debouncedSearch });
        const list = res?.itemsList || res?.data || res || [];

        if (requestIdRef.current !== currentRequestId) return;

        if (Object.keys(entitiesCache.current).length > 20) {
          const firstKey = Object.keys(entitiesCache.current)[0];
          delete entitiesCache.current[firstKey];
        }

        entitiesCache.current[cacheKey] = list;

        if (!isMounted) return;

        setEntities(list);

        if (!entityId && list.length > 0) {
          setSelectedEntityId(list[0].id || list[0]._id);
        }
      } catch {
        toast.error(`Failed to load ${activeTab}s`);
      } finally {
        setIsEntitiesLoading(false);
      }
    };

    fetchEntities();

    return () => {
      isMounted = false;
    };
  }, [activeTab, debouncedSearch, refreshTrigger]);

  // ─── Fetch transactions when selection changes ───
  useEffect(() => {
    if (!selectedEntityId) return;

    if (allTransactions[selectedEntityId]) {
      setTransactions(allTransactions[selectedEntityId]);
    } else {
      setTransactions([]);
    }

    const abortController = new AbortController();

    const fetchTx = async () => {
      setTxLoading(true);
      try {
        const recordType = activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER';
        const res = await getPartyTransactions(selectedEntityId, recordType, { signal: abortController.signal });
        
        if (abortController.signal.aborted) return;
        
        const txList = res?.data || res || [];
        setTransactions(txList);
        setAllTransactions((prev) => ({ ...prev, [selectedEntityId]: txList }));
      } catch {
        if (!abortController.signal.aborted) {
          toast.error('Failed to load transactions');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setTxLoading(false);
        }
      }
    };

    fetchTx();

    return () => {
      abortController.abort();
    };
  }, [selectedEntityId, activeTab]);

  // ─── Add transaction ───
  const handleAddTransaction = React.useCallback(async (formData) => {
    const payload = {
      ...formData,
      recordType: activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER',
      partyId: selectedEntityId
    };

    try {
      await createTransaction(payload);
      toast.success('Transaction recorded! ✓');
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      entitiesCache.current = {};
      setRefreshTrigger(t => t + 1);

      const res = await getPartyTransactions(selectedEntityId, payload.recordType);
      const txList = res?.data || res || [];
      setTransactions(txList);
      setAllTransactions((prev) => ({ ...prev, [selectedEntityId]: txList }));
    } catch {
      toast.error('Failed to record transaction');
    }
  }, [activeTab, selectedEntityId]);

  // ─── Edit transaction ───
  const handleEditSubmit = async () => {
    if (!editTx) return;
    try {
      const payload = {
        amount: Number(editTx.amount),
        paymentMethod: editTx.paymentMethod,
        date: editTx.date,
        note: editTx.note
      };
      await updateTransaction(editTx.id || editTx._id, payload);
      toast.success('Transaction updated! ✓');
      setEditTx(null);
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      entitiesCache.current = {};
      setRefreshTrigger(t => t + 1);
      
      const res = await getPartyTransactions(selectedEntityId, activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER');
      const txList = res?.data || res || [];
      setTransactions(txList);
      setAllTransactions((prev) => ({ ...prev, [selectedEntityId]: txList }));
    } catch {
      toast.error('Failed to update transaction');
    }
  };

  // ─── Delete transaction ───
  const confirmDelete = async () => {
    if (!deleteTx) return;
    try {
      await deleteTransaction(deleteTx.id || deleteTx._id);
      toast.success('Transaction deleted');
      setDeleteTx(null);
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      entitiesCache.current = {};
      setRefreshTrigger(t => t + 1);
      
      const res = await getPartyTransactions(selectedEntityId, activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER');
      const txList = res?.data || res || [];
      setTransactions(txList);
      setAllTransactions((prev) => ({ ...prev, [selectedEntityId]: txList }));
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  // ─── Select entity (with mobile panel switch) ───
  const handleSelect = React.useCallback((id) => {
    setSelectedEntityId(id);
    setMobileView('right');
  }, []);

  // ─── Switch tab ───
  const handleTabChange = React.useCallback((tab) => {
    setActiveTab(tab);
    setSearch(''); // clear search on tab switch
    setSelectedEntityId('');
    setTransactions([]);
    setMobileView('left');
  }, []);

  // ─── Precompute O(1) map for entity lookups ───
  const entitiesMap = useMemo(() => {
    const map = {};
    for (const e of entities) {
      map[e.id || e._id] = e;
    }
    return map;
  }, [entities]);

  // ─── Balance breakdown for selected entity ───
  const selectedEntity = useMemo(
    () => entities.find((e) => e.id === selectedEntityId || e._id === selectedEntityId),
    [entities, selectedEntityId]
  );



  const shellClass = [
    styles.shell,
    mobileView === 'right' ? styles.showRight : styles.showLeft,
  ].join(' ');

  return (
    <>
      <Toaster position="top-right" />
      <div className={shellClass}>
        {/* ─── Left Panel ─── */}
        <div className={styles.leftPanel}>
          <EntityPanel
            activeTab={activeTab}
            onTabChange={handleTabChange}
            search={search}
            onSearchChange={setSearch}
            isLoading={isEntitiesLoading}
            entities={entities}
            selectedEntityId={selectedEntityId}
            onSelect={handleSelect}
            locked={!!lockedType}
          />
        </div>

        {/* ─── Right Panel ─── */}
        <div className={styles.rightPanel}>
          <LedgerPanel
            entity={selectedEntity}
            activeTab={activeTab}
            transactions={transactions}
            loading={txLoading}
            onBack={() => navigate(`/masters/${activeTab}`)}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={(tx) => {
              setEditTx({
                ...tx,
                date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : ''
              });
            }}
            onDeleteTransaction={(tx) => setDeleteTx(tx)}
          />
        </div>
      </div>

      <CreateEditModal
        isOpen={!!editTx}
        onClose={() => setEditTx(null)}
        title="Edit Transaction"
        fields={[
          { name: 'amount', label: 'Amount', type: 'number', required: true },
          { name: 'paymentMethod', label: 'Payment Method', type: 'select', 
            options: [
              { value: 'CASH', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { value: 'CHEQUE', label: 'Cheque' },
              { value: 'N/A', label: 'N/A' },
            ] 
          },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'note', label: 'Note', type: 'textarea' }
        ]}
        values={editTx || {}}
        onChange={(field, val) => setEditTx(prev => ({ ...prev, [field]: val }))}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTx}
        onCancel={() => setDeleteTx(null)}
        onConfirm={confirmDelete}
        entityName={deleteTx?.label || deleteTx?.type || "transaction"}
      />
    </>
  );
}
