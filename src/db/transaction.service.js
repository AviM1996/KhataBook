import { getDb } from "./index";
import { v4 as uuid } from "uuid";

export async function addTransaction(data) {
  const db = await getDb();

  return db.transactions.insert({
    id: uuid(), // ✅ FIXED
    customerId: data.customerId,
    amount: data.amount,
    type: data.type, // CREDIT | DEBIT
    date: new Date().toISOString(),
    synced: false,
  });
}

export async function getTransactionsByCustomer(customerId) {
  const db = await getDb();

  const docs = await db.transactions
    .find({
      selector: { customerId },
      sort: [{ date: "desc" }],
    })
    .exec();

  return docs.map(d => d.toJSON());
}

export async function getBalanceByCustomer(customerId) {
  const db = await getDb();

  const docs = await db.transactions
    .find({
      selector: { customerId },
    })
    .exec();

  let credit = 0;
  let debit = 0;

  docs.forEach(d => {
    const t = d.toJSON();
    if (t.type === "CREDIT") credit += t.amount;
    else debit += t.amount;
  });

  return credit - debit;
}

export async function getRecentTransactions(limit = 5) {
  const db = await getDb();

  const docs = await db.transactions
    .find({
      sort: [{ date: "desc" }],
      limit,
    })
    .exec();

console.log("......................",docs)

  return docs.map(d => d.toJSON());
}

export async function getAllTransactions() {
  const db = await getDb();
  const docs = await db.transactions.find().exec();
  return docs.map(d => d.toJSON());
}
