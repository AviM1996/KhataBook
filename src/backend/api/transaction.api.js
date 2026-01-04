import {
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  runTransaction,
  serverTimestamp,
  doc,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import { transactionsCol } from "../firebase/transaction.ref";
import { customerDoc } from "../firebase/customer.ref";
import {validateTransaction,buildTransaction,} from "../model/transaction.model";


export async function createTransaction(payload) {
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED");

  validateTransaction(payload);

  const txn = buildTransaction(payload, user.uid);

  await runTransaction(db, async (firestoreTxn) => {
    const customerRef = customerDoc(payload.customerId);
    const customerSnap = await firestoreTxn.get(customerRef);

    if (!customerSnap.exists()) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    if (customerSnap.data().ownerId !== user.uid) {
      throw new Error("FORBIDDEN");
    }

    const currentBalance = customerSnap.data().balance || 0;

    const newBalance =
      txn.type === "CREDIT"
        ? currentBalance + txn.amount
        : currentBalance - txn.amount;

    // 1️⃣ Save transaction
    firestoreTxn.set(doc(transactionsCol()), {
      ...txn,
      createdAt: serverTimestamp(),
    });

    // 2️⃣ Update cached balance
    firestoreTxn.update(customerRef, {
      balance: newBalance,
      updatedAt: serverTimestamp(),
    });
  });

  return true;
}

export function subscribeTransactions(customerId, callback) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    transactionsCol(),
    where("customerId", "==", customerId),
    where("ownerId", "==", user.uid)
  );

  return onSnapshot(
    q,
    (snap) => {
      const txns = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(txns);
    },
    (error) => {
      console.error("[subscribeTransactions ERROR]", error);
    }
  );
}

export async function getCustomerBalance(customerId) {
  const snap = await getDoc(customerDoc(customerId));
  if (!snap.exists()) return 0;

  return snap.data().balance || 0;
}

