import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

import EntityPanel from './components/EntityPanel';
import LedgerPanel from './components/LedgerPanel';
import styles from './LedgerV2.module.css';

/* =====================================================
   UniversalLedgerPage — WhatsApp-style two-panel layout
   ===================================================== */
export default function UniversalLedgerPage() {
  const { entityType, entityId } = useParams();
  const navigate = useNavigate();

  const lockedType = entityType === 'supplier' ? 'supplier' : entityType === 'customer' ? 'customer' : null;

  const [activeTab, setActiveTab] = useState(lockedType || 'customer');
  const [entities, setEntities] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState(entityId || '');
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState({}); // entityId → []
  const [txLoading, setTxLoading] = useState(false);

  // Mobile: track which panel is visible
  const [mobileView, setMobileView] = useState(entityId ? 'right' : 'left');

  // ─── Fetch entities on tab change ───
  useEffect(() => {
    const fetch = async () => {
      try {
        const endpoint = activeTab === 'customer' ? '/api/customers' : '/api/suppliers';
        const res = await axios.get(endpoint);
        setEntities(res.data);
        if (!entityId && res.data.length > 0) {
          setSelectedEntityId(res.data[0].id || res.data[0]._id);
        }
      } catch {
        toast.error(`Failed to load ${activeTab}s`);
      }
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ─── Fetch transactions when selection changes ───
  useEffect(() => {
    if (!selectedEntityId) return;
    const fetchTx = async () => {
      setTxLoading(true);
      try {
        const params = { recordType: activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER' };
        if (activeTab === 'customer') params.customerId = selectedEntityId;
        else params.supplierId = selectedEntityId;

        const res = await axios.get('/api/transactions', { params });
        setTransactions(res.data);
        setAllTransactions((prev) => ({ ...prev, [selectedEntityId]: res.data }));
      } catch {
        toast.error('Failed to load transactions');
      } finally {
        setTxLoading(false);
      }
    };
    fetchTx();
  }, [selectedEntityId, activeTab]);

  // ─── Add transaction ───
  const handleAddTransaction = async (formData) => {
    const payload = {
      ...formData,
      recordType: activeTab === 'customer' ? 'CUSTOMER' : 'SUPPLIER',
    };
    if (activeTab === 'customer') payload.customerId = selectedEntityId;
    else payload.supplierId = selectedEntityId;

    await axios.post('/api/transactions', payload);
    toast.success('Transaction recorded! ✓');

    // Refresh
    const params = { recordType: payload.recordType };
    if (activeTab === 'customer') params.customerId = selectedEntityId;
    else params.supplierId = selectedEntityId;
    const res = await axios.get('/api/transactions', { params });
    setTransactions(res.data);
    setAllTransactions((prev) => ({ ...prev, [selectedEntityId]: res.data }));
  };

  // ─── Select entity (with mobile panel switch) ───
  const handleSelect = (id) => {
    setSelectedEntityId(id);
    setMobileView('right');
  };

  // ─── Switch tab ───
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedEntityId('');
    setTransactions([]);
    setMobileView('left');
  };

  // ─── Balance breakdown for selected entity ───
  const selectedEntity = useMemo(
    () => entities.find((e) => e.id === selectedEntityId || e._id === selectedEntityId),
    [entities, selectedEntityId]
  );

  const calcStats = (txList) => {
    if (!txList) return null;
    let tc = 0, td = 0;
    txList.forEach((t) => {
      if (activeTab === 'customer') {
        if (t.type === 'SALE') td += t.amount;
        if (t.type === 'RETURN' || t.type === 'PAYMENT') tc += t.amount;
      } else {
        if (t.type === 'PURCHASE') tc += t.amount;
        if (t.type === 'RETURN' || t.type === 'PAYMENT') td += t.amount;
      }
    });
    const ob = selectedEntity?.openingBalance || 0;
    const bd = selectedEntity?.balanceDirection;
    let outstanding = 0;
    if (activeTab === 'customer') {
      outstanding = bd === 'Receivable' ? ob + (td - tc) : ob + (tc - td);
    } else {
      outstanding = bd === 'Payable' ? ob + (tc - td) : ob + (td - tc);
    }
    const lastTx = txList[txList.length - 1];
    return { totalCredit: tc, totalDebit: td, outstanding, lastTxDate: lastTx?.date };
  };

  const selectedStats = useMemo(
    () => (selectedEntity ? calcStats(transactions) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, selectedEntity, activeTab]
  );

  // Pre-compute stats for every entity that has cached transactions
  const entityStats = useMemo(() => {
    const map = {};
    Object.entries(allTransactions).forEach(([id, txList]) => {
      const entity = entities.find((e) => e.id === id || e._id === id);
      if (!entity) return;
      let tc = 0, td = 0;
      txList.forEach((t) => {
        if (activeTab === 'customer') {
          if (t.type === 'SALE') td += t.amount;
          if (t.type === 'RETURN' || t.type === 'PAYMENT') tc += t.amount;
        } else {
          if (t.type === 'PURCHASE') tc += t.amount;
          if (t.type === 'RETURN' || t.type === 'PAYMENT') td += t.amount;
        }
      });
      const ob = entity.openingBalance || 0;
      const bd = entity.balanceDirection;
      let outstanding = 0;
      if (activeTab === 'customer') {
        outstanding = bd === 'Receivable' ? ob + (td - tc) : ob + (tc - td);
      } else {
        outstanding = bd === 'Payable' ? ob + (tc - td) : ob + (td - tc);
      }
      const lastTx = txList[txList.length - 1];
      map[id] = { totalCredit: tc, totalDebit: td, outstanding, lastTxDate: lastTx?.date };
    });
    return map;
  }, [allTransactions, entities, activeTab]);

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
            activeTab={lockedType || activeTab}
            onTabChange={handleTabChange}
            entities={entities}
            selectedEntityId={selectedEntityId}
            onSelect={handleSelect}
            entityStats={entityStats}
            locked={!!lockedType}
          />
        </div>

        {/* ─── Right Panel ─── */}
        <div className={styles.rightPanel}>
          <LedgerPanel
            entity={selectedEntity}
            activeTab={activeTab}
            stats={selectedStats}
            transactions={transactions}
            loading={txLoading}
            onBack={() => navigate('/masters')}
            onAddTransaction={handleAddTransaction}
          />
        </div>
      </div>
    </>
  );
}
