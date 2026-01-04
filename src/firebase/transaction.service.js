import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

/* ===============================
   Helper: YYYY-MM
================================ */
function getYearMonth(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/* ===============================
   Get transactions by customer
   (non-realtime, optional use)
================================ */
export async function getTransactionsByCustomer(customerId) {
  if (!auth.currentUser || !customerId) return [];

  const q = query(
    collection(db, "transactions"),
    where("customerId", "==", customerId),
    where("ownerId", "==", auth.currentUser.uid),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/* ===============================
   Add transaction (CREDIT / DEBIT)
================================ */
export const addTransaction = async ({
  customerId,
  type,
  amount,
  note = "",
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  if (!customerId) throw new Error("customerId missing");

  // ✅ FIX 1: normalize type
  const normalizedType = String(type).toUpperCase();

  // ✅ FIX 2: validate normalized type
  if (!["CREDIT", "DEBIT"].includes(normalizedType)) {
    console.error("❌ Invalid transaction type received:", type);
    throw new Error("Invalid transaction type");
  }

  // ✅ FIX 3: safe amount conversion
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid amount");
  }

  // ✅ FIX 4: save normalized type
  return addDoc(collection(db, "transactions"), {
    customerId,                 // 🔥 REQUIRED (customer doc.id)
    ownerId: user.uid,          // 🔥 REQUIRED
    amount: numericAmount,
    type: normalizedType,       // 🔥 ALWAYS CREDIT / DEBIT
    note,
    yearMonth: getYearMonth(),
    createdAt: serverTimestamp(),
  });
};
