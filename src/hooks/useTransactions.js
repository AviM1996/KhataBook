import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "./useAuth";

/**
 * 🔥 useTransactions
 * - Realtime
 * - Permission safe
 * - Ledger ready
 */
export function useTransactions(customerId, recentLimit = 5) {
  const { user, loading: authLoading } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !user || !customerId) {
      setTransactions([]);
      setRecent([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "transactions"),
      where("customerId", "==", customerId),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(list);
        setRecent(list.slice(0, recentLimit));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Error loading transactions:", err);
        setError(err.message);
        setTransactions([]);
        setRecent([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, customerId, recentLimit]);

  /* ===============================
     Available months (YYYY-MM)
  ================================ */
  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.yearMonth) set.add(t.yearMonth);
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  return {
    transactions,
    recent,
    loading,
    error,
    availableMonths,
  };
}
