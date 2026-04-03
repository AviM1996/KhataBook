import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import EntityPanel from '../../components/features/ledger/EntityPanel';
import LedgerPanel from '../../ledger/components/LedgerPanel';

import { useParams, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { getParties } from '../../api/party';
import { getPartyTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../api/transaction';
import { TRANSACTION_FIELDS } from '../../config/entityConfig';
import { Page, ActionButtons } from '../../components';
import { useModal } from '../../context/ModalContext';

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

  const { openModal, closeModal } = useModal();

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

  // ─── Refresh transactions after edit/delete ───
  const refreshAfterChange = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['parties'] });
    entitiesCache.current = {};
    setRefreshTrigger((t) => t + 1);

    const recordType = activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER';
    const res = await getPartyTransactions(selectedEntityId, recordType);
    const txList = res?.data || res || [];
    setTransactions(txList);
    setAllTransactions((prev) => ({ ...prev, [selectedEntityId]: txList }));
  }, [activeTab, selectedEntityId]);

  // ─── Edit transaction via modal ───
  const handleEditTransaction = useCallback((tx) => {
    const formattedTx = {
      ...tx,
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '',
    };
    openModal('createEdit', {
      title: 'Edit Transaction',
      fields: TRANSACTION_FIELDS,
      values: formattedTx,
      onSubmit: async (formValues) => {
        try {
          await updateTransaction(tx.id || tx._id, {
            amount: Number(formValues.amount),
            paymentMethod: formValues.paymentMethod,
            date: formValues.date,
            note: formValues.note,
          });
          toast.success('Transaction updated! ✓');
          closeModal();
          await refreshAfterChange();
        } catch {
          toast.error('Failed to update transaction');
        }
      },
    });
  }, [openModal, closeModal, refreshAfterChange]);

  // ─── Delete transaction via modal ───
  const handleDeleteTransaction = useCallback((tx) => {
    openModal('confirmDelete', {
      entityName: tx.label || tx.type || 'transaction',
      onConfirm: async () => {
        try {
          await deleteTransaction(tx.id || tx._id);
          toast.success('Transaction deleted');
          closeModal();
          await refreshAfterChange();
        } catch {
          toast.error('Failed to delete transaction');
        }
      },
    });
  }, [openModal, closeModal, refreshAfterChange]);

  // ─── Select entity (with mobile panel switch) ───
  const handleSelect = useCallback((id) => {
    setSelectedEntityId(id);
    setMobileView('right');
  }, []);

  // ─── Switch tab ───
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearch('');
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
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      </div>
    </>
  );
}
