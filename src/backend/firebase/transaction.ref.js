import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";

export const TRANSACTIONS_COLLECTION = "transactions";

export const transactionsCol = () =>
  collection(db, TRANSACTIONS_COLLECTION);

export const transactionDoc = (id) => {
  if (!id) throw new Error("TRANSACTION_ID_REQUIRED");
  return doc(db, TRANSACTIONS_COLLECTION, id);
};
