import { useEffect, useState, useCallback } from "react";

// ✅ IMPORT FROM api (NOT service)
import {
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  listenCustomers,
} from "../api/customer.api";

export function useCustomers({ role }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 realtime list
  useEffect(() => {
    setLoading(true);

    const unsubscribe = listenCustomers(
      { role },
      (data) => {
        setCustomers(data);
        setLoading(false);
      }
    );

    return () => unsubscribe && unsubscribe();
  }, [role]);

  // ➕ create
  const addCustomer = useCallback(async (payload) => {
    try {
      setError(null);
      return await createCustomer(payload);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ✏️ update
  const editCustomer = useCallback(async (id, payload) => {
    try {
      setError(null);
      await updateCustomer(id, payload);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // 🗑️ delete (soft)
  const deleteCustomer = useCallback(async (id) => {
    try {
      setError(null);
      await softDeleteCustomer(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    customers,
    loading,
    error,
    addCustomer,
    editCustomer,
    deleteCustomer,
  };
}
