import { useEffect, useState } from "react";
import { getCustomerTransactions } from "../api/transaction";

export function useTransactions(customerId, recentLimit = 5) {
  const [transactions, setTransactions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTxns = async () => {
    setLoading(true);
    try {
      const data = await getCustomerTransactions(customerId);
      setTransactions(data || []);
      setRecent((data || []).slice(0, recentLimit));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTxns();
  }, [customerId, recentLimit]);

  const availableMonths = [];

  return {
    transactions,
    recent,
    loading,
    error,
    availableMonths,
    reload: loadTxns,
  };
}
