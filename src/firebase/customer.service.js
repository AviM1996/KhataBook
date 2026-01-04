import {collection,addDoc,query,where,onSnapshot,doc,updateDoc,deleteDoc,serverTimestamp,getDoc} from "firebase/firestore";
  
import { db } from "./firebase";
import { auth } from "./firebase";

import { customersCol, customerDoc } from "./customer.ref";

/**
 * Add new customer
 */
export const addCustomer = async (payload) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  return addDoc(collection(db, "customers"), {
    ...payload,
    ownerId: user.uid,      // 🔥 REQUIRED
    isDeleted: false,       // 🔥 REQUIRED
    createdAt: serverTimestamp(),
  });
};

export const listenCustomers = (callback, role, uid) => {
  let q;

  if (role === "admin" || role === "subadmin") {
    q = query(
      collection(db, "customers"),
      where("isDeleted", "==", false)
    );
  } else {
    if (!uid) {
      callback([]);
      return () => {};
    }

    q = query(
      collection(db, "customers"),
      where("ownerId", "==", uid),  
      where("isDeleted", "==", false)
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      console.log("📥 snapshot size:", snapshot.size);

      const customers = snapshot.docs.map((doc) => {
        console.log("📄 doc:", doc.id, doc.data());
        return { id: doc.id, ...doc.data() };
      });

      callback(customers);
    },
    (error) => {
      console.error("❌ listenCustomers error:", error);
    }
  );
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
  //console.log("Deleting customer id:", customerId);
  const ref = doc(db, "customers", customerId);
  await deleteDoc(ref);
  //console.log("Deleted from Firestore");
};

export async function getCustomerById(id) {
  const ref = doc(db, "customers", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
export const softDeleteCustomer = async (customerId) => {
  const ref = doc(db, "customers", customerId);
  await updateDoc(ref, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
  });
};