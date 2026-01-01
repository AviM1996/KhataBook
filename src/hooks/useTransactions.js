import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { auth } from "../firebase/firebase";

export function useTransactions(recentLimit = 5) {
  const [transactions, setTransactions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // 🔄 all transactions
    const qAll = query(
      collection(db, "transactions"),
      where("uid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    // 🕒 recent transactions
    const qRecent = query(
      collection(db, "transactions"),
      where("uid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(recentLimit)
    );

    const unsubAll = onSnapshot(qAll, (snap) => {
      setTransactions(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    });

    const unsubRecent = onSnapshot(qRecent, (snap) => {
      setRecent(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => {
      unsubAll();
      unsubRecent();
    };
  }, [recentLimit]);

    const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.yearMonth) set.add(t.yearMonth);
    });

    return Array.from(set)
      .sort()
      .reverse(); // latest first
  }, [transactions]);

  return {
    transactions,
    recent,
    loading,
    availableMonths
  };
}
