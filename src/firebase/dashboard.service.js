import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { auth } from "../firebase/firebase";

export const listenCustomers = (callback, role) => {
  //console.log("🔥 listenCustomers | role:", role);

  let q;

  if (role === "admin" || role === "subadmin") {
    q = query(collection(db, "customers"));
  } else {
    if (!auth.currentUser) {
      //console.log("⛔ auth.currentUser null");
      callback([]);
      return () => {};
    }

    q = query(
      collection(db, "customers"),
      where("uid", "==", auth.currentUser.uid)
    );
  }

  return onSnapshot(q, (snapshot) => {
    //console.log("📥 snapshot size:", snapshot.size);

    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(customers);
  });
};
