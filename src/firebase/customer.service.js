import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

import { db } from "./firebase";
import { auth } from "./firebase";

/**
 * Add new customer
 */
export const addCustomer = async ({ name, address, phone }) => {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  return addDoc(collection(db, "customers"), {
    uid: auth.currentUser.uid,
    name,
    address: address || "",
    phone,
    balance: 0,
    createdAt: serverTimestamp(),
  });
};

/**
 * Listen all customers of logged-in user
 */
export const listenCustomers = (callback, role) => {
  let q;

  if (role === "admin" || role === "subadmin") {
    // 🔥 Admin / Subadmin → all customers
    q = query(collection(db, "customers"));
  } else {
    // 👤 Normal user → own customers
    q = query(
      collection(db, "customers"),
      where("uid", "==", auth.currentUser.uid)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(customers);
  });
};


/**
 * Update customer basic info
 */
export const updateCustomer = async (customerId, data) => {
  const ref = doc(db, "customers", customerId);
  return updateDoc(ref, data);
};

/**
 * Delete customer
 */
export const deleteCustomer = async (customerId) => {
  const ref = doc(db, "customers", customerId);
  return deleteDoc(ref);
};

export async function getCustomerById(id) {
  const ref = doc(db, "customers", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
