import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";

export const CUSTOMERS_COLLECTION = "customers";

export const customersCol = () => {
  return collection(db, CUSTOMERS_COLLECTION);
};

export const customerDoc = (customerId) => {
  return doc(db, CUSTOMERS_COLLECTION, customerId);
};
