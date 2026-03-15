import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { getCustomers } from '../api/customer';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/supplier';
import { createCustomer, updateCustomer, softDeleteCustomer } from '../api/customer';
import { useAuth } from '../context/AuthContext';

/**
 * Unified hook for the Masters page.
 * Handles fetching, CRUD, summary stats, growth indicators, time filtering for both Customers & Suppliers.
 */
export function useMasters() {
  const { role } = useAuth();

  const [activeTab, setActiveTab] = useState('customer');
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState('monthly');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    address: '',
    openingBalance: 0,
    balanceDirection: 'Receivable',
  });
  const [saving, setSaving] = useState(false);

  // ---------- FETCHING ----------
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomers(role);
      setCustomers(data || []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [role]);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data || []);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'customer') {
      fetchCustomers();
    } else {
      fetchSuppliers();
    }
  }, [activeTab, fetchCustomers, fetchSuppliers]);

  // Reset search on tab switch
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  // ---------- CURRENT DATA ----------
  const currentData = activeTab === 'customer' ? customers : suppliers;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return currentData;
    const q = searchQuery.toLowerCase();
    return currentData.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.phone && item.phone.includes(q))
    );
  }, [currentData, searchQuery]);

  // ---------- SUMMARY STATS ----------
  const summaryStats = useMemo(() => {
    const items = currentData;
    const totalCount = items.length;
    let totalSalesOrPurchase = 0;
    let totalPayment = 0;
    let totalOutstanding = 0;

    items.forEach((item) => {
      if (activeTab === 'customer') {
        totalSalesOrPurchase += Math.abs(item.totalDebit || 0);
        totalPayment += Math.abs(item.totalCredit || 0);
      } else {
        totalSalesOrPurchase += Math.abs(item.totalCredit || 0);
        totalPayment += Math.abs(item.totalDebit || 0);
      }
      totalOutstanding += item.outstandingBalance || 0;
    });

    return {
      totalCount,
      totalSalesOrPurchase,
      totalPayment,
      totalOutstanding,
    };
  }, [currentData, activeTab]);

  // ---------- GROWTH INDICATORS ----------
  // Simulated growth percentages based on time period
  const growthData = useMemo(() => {
    const periodLabels = {
      today: 'vs yesterday',
      weekly: 'vs last week',
      monthly: 'vs last month',
      yearly: 'vs last year',
    };
    const label = periodLabels[timePeriod] || '';

    // Use seeded pseudo-random values for consistent demo display
    const seed = activeTab === 'customer' ? 1 : 2;
    const periodSeed = { today: 1, weekly: 2, monthly: 3, yearly: 4 }[timePeriod] || 1;
    const base = seed * periodSeed;

    return {
      countGrowth: { value: ((base * 7 + 3) % 25) - 5, label },
      salesGrowth: { value: ((base * 13 + 7) % 30) - 8, label },
      paymentGrowth: { value: ((base * 11 + 2) % 20) - 3, label },
      outstandingGrowth: { value: -((base * 5 + 1) % 15), label },
    };
  }, [activeTab, timePeriod]);

  // ---------- CRUD OPERATIONS ----------
  const openCreateModal = useCallback(() => {
    setEditId(null);
    setFormValues({
      name: '',
      phone: '',
      address: '',
      openingBalance: 0,
      balanceDirection: activeTab === 'customer' ? 'Receivable' : 'Payable',
    });
    setIsModalOpen(true);
  }, [activeTab]);

  const openEditModal = useCallback((item) => {
    setEditId(item.id || item._id);
    setFormValues({
      name: item.name || '',
      phone: item.phone || '',
      address: item.address || '',
      openingBalance: item.openingBalance || 0,
      balanceDirection: item.balanceDirection || 'Receivable',
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditId(null);
  }, []);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (activeTab === 'customer') {
        if (editId) {
          await updateCustomer(editId, formValues);
          toast.success('Customer updated!');
        } else {
          await createCustomer(formValues);
          toast.success('Customer created!');
        }
        await fetchCustomers();
      } else {
        if (editId) {
          await updateSupplier(editId, formValues);
          toast.success('Supplier updated!');
        } else {
          await createSupplier(formValues);
          toast.success('Supplier created!');
        }
        await fetchSuppliers();
      }
      closeModal();
    } catch {
      toast.error('Operation failed');
    } finally {
      setSaving(false);
    }
  }, [activeTab, editId, formValues, fetchCustomers, fetchSuppliers, closeModal]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Are you sure you want to delete this record?')) return;
      try {
        if (activeTab === 'customer') {
          await softDeleteCustomer(id);
          toast.success('Customer deleted!');
          await fetchCustomers();
        } else {
          await deleteSupplier(id);
          toast.success('Supplier deleted!');
          await fetchSuppliers();
        }
      } catch {
        toast.error('Delete failed');
      }
    },
    [activeTab, fetchCustomers, fetchSuppliers]
  );

  return {
    // Tab
    activeTab,
    setActiveTab,
    // Data
    loading,
    filteredData,
    searchQuery,
    setSearchQuery,
    // Time filter
    timePeriod,
    setTimePeriod,
    // Summary
    summaryStats,
    growthData,
    // Modal / CRUD
    isModalOpen,
    editId,
    formValues,
    saving,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFieldChange,
    handleSave,
    handleDelete,
  };
}
