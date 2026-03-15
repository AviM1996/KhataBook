import { useEffect, useState, useCallback } from "react";
import { getCustomerById } from "../api/customer";
import { createTransaction, getCustomerTransactions, updateTransaction, deleteTransaction } from "../api/transaction";

export function useLedger(customerId) {
  const [customer, setCustomer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const txns = await getCustomerTransactions(customerId);

      setCustomer(c);
      setEntries(txns);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const addEntry = async (customerId, type, amount, note) => {
    await createTransaction({
      customerId,
      type,
      amount,
      note,
    });

    const txns = await getCustomerTransactions(customerId);
    setEntries(txns);
  };

  const editEntry = async (transactionId, payload) => {
    await updateTransaction(transactionId, payload);
    const txns = await getCustomerTransactions(customerId);
    setEntries(txns);
  };

  const removeEntry = async (transactionId) => {
    await deleteTransaction(transactionId);
    const txns = await getCustomerTransactions(customerId);
    setEntries(txns);
  };

  return {
    customer,
    entries,
    loading,
    error,
    addEntry,
    editEntry,
    removeEntry,
    reload: loadLedger,
  };
}
