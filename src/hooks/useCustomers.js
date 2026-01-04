import { useEffect, useState, useCallback } from "react";
import {
  listenCustomers as listenCustomersService,
  addCustomer as addCustomerService,
  updateCustomer as updateCustomerService,
  softDeleteCustomer as softDeleteCustomer,
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
    console.log("🧠 AUTH STATE →", { authLoading, user, role });
    

    // ⏳ Auth still loading → keep hook loading
    if (authLoading) {
      setLoading(true);
      return;
    }

    // ⛔ Auth done but no user/role
    if (!user || !role) {
      console.log("⛔ Listener skipped (user/role missing)");
      setCustomers([]);
      setLoading(false);
      return;
    }

    console.log("🔥 Calling listenCustomers", 
      {
      uid: user.uid,
      role,
    });

    setLoading(true);

    const unsubscribe = listenCustomersService(
      (data) => {
        console.log("📦 Customers received:", data);
        setCustomers(data);
        setLoading(false);
      },
      role,
      user.uid
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, role, authLoading]);

  /* ================= ACTIONS ================= */

  const addCustomer = useCallback(async (payload) => {
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
  }, []);

  const updateCustomer = useCallback(async (id, payload) => {
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
  }, []);

  const deleteCustomer = useCallback(async (id) => {
    try {
      setLoading(true);
      await softDeleteCustomer(id);
    } catch (err) {
      console.error(err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= HELPERS ================= */

  const getCustomerById = useCallback(
    (id) => customers.find((c) => c.id === id) || null,
    [customers]
  );

  /* ================= RETURN ================= */

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
