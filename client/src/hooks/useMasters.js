/**
 * ⚠️  DEPRECATED — useMasters.js
 *
 * Original unified hook for the MastersPage. Replaced by:
 *   - src/store/useMastersStore.js  (UI state: activeTab, searchQuery, page, modal)
 *   - src/hooks/usePartyQuery.js    (data fetching via React Query)
 *   - src/hooks/usePartyMutations.js (CRUD mutations with optimistic updates)
 *   - src/config/entityConfig.js    (labels, fields, summary config per entity)
 *
 * All code below is commented out. Safe to delete once confirmed stable.
 */

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { toast } from 'react-hot-toast';
// import { getCustomers } from '../api/customer';
// import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/supplier';
// import { createCustomer, updateCustomer, softDeleteCustomer } from '../api/customer';
// import { useAuth } from '../context/AuthContext';
//
// export function useMasters() {
//   const { role } = useAuth();
//
//   const [activeTab, setActiveTab] = useState('customer');
//   const [customers, setCustomers] = useState([]);
//   const [suppliers, setSuppliers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [timePeriod, setTimePeriod] = useState('monthly');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [formValues, setFormValues] = useState({ name: '', phone: '', address: '', notes: '' });
//   const [saving, setSaving] = useState(false);
//
//   const fetchCustomers = useCallback(async () => { ... }, []);
//   const fetchSuppliers = useCallback(async () => { ... }, []);
//
//   // ... (330 lines removed — see git history for full source)
//
//   return {
//     activeTab, setActiveTab, loading, filteredData,
//     searchQuery, setSearchQuery, timePeriod, setTimePeriod,
//     summaryStats, growthData, isModalOpen, editId, formValues,
//     saving, openCreateModal, openEditModal, closeModal,
//     handleFieldChange, handleSave, handleDelete,
//   };
// }
