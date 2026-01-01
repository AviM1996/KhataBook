import { useEffect, useState, useCallback } from "react";
import {
  listenCustomers as listenCustomersService,
  addCustomer as addCustomerService,
  updateCustomer as updateCustomerService,
  deleteCustomer as deleteCustomerService,
} from "../firebase/customer.service";

import { useAuth } from "./useAuth";

/**
 * 🔥 useCustomers (role-aware)
 * - admin / subadmin → all customers
 * - normal user → only own customers
 */
export function useCustomers() {
  const { user, role, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= REALTIME LISTENER ================= */

  useEffect(() => {
    if (authLoading) return;
    if (!user || !role) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 🔥 role-aware listener
    const unsubscribe = listenCustomersService(
      (data) => {
        setCustomers(data);
        setLoading(false);
      },
      role
    );

    return () => unsubscribe();
  }, [user, role, authLoading]);

  /* ================= ACTIONS ================= */

  const addCustomer = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        await addCustomerService(payload);
      } catch (err) {
        console.error(err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCustomer = useCallback(
    async (id, payload) => {
      try {
        setLoading(true);
        await updateCustomerService(id, payload);
      } catch (err) {
        console.error(err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCustomer = useCallback(
    async (id) => {
      try {
        setLoading(true);
        await deleteCustomerService(id);
      } catch (err) {
        console.error(err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ================= HELPERS ================= */

  const getCustomerById = useCallback(
    (id) => customers.find((c) => c.id === id) || null,
    [customers]
  );

  /* ================= RETURN ================= */

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    role, // 👈 useful for UI badge / condition
  };
}
