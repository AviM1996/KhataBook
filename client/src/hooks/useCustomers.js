import { useEffect, useState, useCallback } from "react";
import { getCustomers, createCustomer as addCustomerService, updateCustomer as updateCustomerService, softDeleteCustomer } from "../api/customer";
import { useAuth } from "../context/AuthContext";

export function useCustomers() {
  const { user, role, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    if (authLoading || !user || !role) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getCustomers(role);
      setCustomers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, role]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = useCallback(async (payload) => {
    setLoading(true);
    try {
      await addCustomerService(payload);
      await fetchCustomers();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      await updateCustomerService(id, payload);
      await fetchCustomers();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id) => {
    setLoading(true);
    try {
      await softDeleteCustomer(id);
      await fetchCustomers();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  const getCustomerById = useCallback(
    (id) => customers.find((c) => c.id === id) || null,
    [customers]
  );

  return {
    customers,
    customerCount: customers.length,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    role,
  };
}
