import client from './client';

export async function createTransaction(payload) {
  return client('transactions', { body: payload });
}

export async function getCustomerTransactions(customerId) {
  return client(`transactions?customerId=${customerId}`);
}

export async function updateTransaction(id, payload) {
  return client(`transactions/${id}`, { method: 'PUT', body: payload });
}

export async function deleteTransaction(id) {
  return client(`transactions/${id}`, { method: 'DELETE' });
}

export async function getCustomerBalance(customerId) {
  return client(`customers/${customerId}/balance`);
}
