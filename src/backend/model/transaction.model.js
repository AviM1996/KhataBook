export const TransactionModel = {
  amount: 0,
  type: "CREDIT", // CREDIT | DEBIT
  customerId: "",
  ownerId: "",
  note: "",
  createdAt: null,
};

export function validateTransaction(payload) {
  if (!payload.customerId) {
    throw new Error("CUSTOMER_ID_REQUIRED");
  }

  if (!payload.amount || Number(payload.amount) <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  if (!["CREDIT", "DEBIT"].includes(payload.type)) {
    throw new Error("INVALID_TRANSACTION_TYPE");
  }

  return true;
}

export function buildTransaction(payload, ownerId) {
  return {
    amount: Number(payload.amount),
    type: payload.type,
    customerId: payload.customerId,
    ownerId,
    ...(payload.note && { note: payload.note.trim() }),
  };
}
