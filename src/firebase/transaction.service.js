import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";

function getYearMonth(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // YYYY-MM
}

/**
 * 🔄 Get transactions by customer (latest first)
 */
export async function getTransactionsByCustomer(customerId) {
  if (!auth.currentUser || !customerId) return [];

  const q = query(
    collection(db, "transactions"),
    where("customerId", "==", customerId),
    where("uid", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * ➕ Add transaction (Credit / Debit with note)
 */
export async function addTransaction({
  customerId,
  type,      // CREDIT | DEBIT
  amount,
  note,      // 📝 optional
}) {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  return addDoc(collection(db, "transactions"), {
    uid: auth.currentUser.uid,
    customerId,
    type,
    amount: Number(amount),
    note: note || "",
    yearMonth: getYearMonth(),
    createdAt: serverTimestamp(),
  });
}
