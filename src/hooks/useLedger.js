import { useEffect, useState, useCallback } from "react";
import { getCustomerById } from "../firebase/customer.service";
import {
  addTransaction,
  getTransactionsByCustomer,
} from "../firebase/transaction.service";

export function useLedger(customerId) {
  const [customer, setCustomer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Load customer + transactions
  const loadLedger = useCallback(async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);

      const c = await getCustomerById(customerId);
      if (!c) {
        setCustomer(null);
        setEntries([]);
        return;
      }

      const txns = await getTransactionsByCustomer(customerId);

      setCustomer(c);
      setEntries(txns);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  // ➕ CREDIT / DEBIT with note (🔥 FIXED ORDER)
  const addEntry = async (customerId, type, amount, note) => {
    await addTransaction({
      customerId,
      type,
      amount,
      note,
    });

    const txns = await getTransactionsByCustomer(customerId);
    setEntries(txns);
  };

  return {
    customer,
    entries,
    loading,
    error,
    addEntry,
    reload: loadLedger,
  };
}
