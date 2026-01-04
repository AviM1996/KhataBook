import {
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { auth } from "../firebase/firebase";
import { customersCol, customerDoc } from "../firebase/customer.ref";

import {buildCustomer,validateCustomer,validateCustomerUpdate,} from "../model/customer.model";

export async function createCustomer(payload) {
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED");

  validateCustomer(payload);

  const customer = buildCustomer(payload, user.uid);

  const ref = await addDoc(customersCol(), {
    ...customer,
    createdAt: serverTimestamp(),
  });

  return { id: ref.id };
}

export async function updateCustomer(id, payload) {
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED");

  const snap = await getDoc(customerDoc(id));
  if (!snap.exists()) throw new Error("NOT_FOUND");

  // FIX: owner check (already correct, marking for clarity)
  if (snap.data().ownerId !== user.uid) {
    throw new Error("FORBIDDEN");
  }

  // FIX: partial validation only
  validateCustomerUpdate(payload);

  await updateDoc(customerDoc(id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });

  return true;
}

export async function getCustomerById(id) {
  const snap = await getDoc(customerDoc(id));
  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

export function listenCustomers({ role }, callback) {
  let q;

  if (role === "admin" || role === "subadmin") {
    // FIX: admin should not see deleted data
    q = query(
      customersCol(),
      where("isDeleted", "==", false)
    );
  } else {
    const user = auth.currentUser;
    if (!user) {
      callback([]);
      return () => {};
    }

    q = query(
      customersCol(),
      where("ownerId", "==", user.uid),
      where("isDeleted", "==", false)
    );
  }

  return onSnapshot(
    q,
    (snap) => {
      const customers = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(customers);
    },
    (error) => {
      // FIX: proper error logging
      console.error("[listenCustomers ERROR]", error);
    }
  );
}

export async function softDeleteCustomer(id) {
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED");

  const snap = await getDoc(customerDoc(id));
  if (!snap.exists()) throw new Error("NOT_FOUND");

  if (snap.data().ownerId !== user.uid) {
    throw new Error("FORBIDDEN");
  }

  await updateDoc(customerDoc(id), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
  });

  return true;
}
