import client from './client';

export async function createTransaction(payload) {
  return client('transactions/add', { body: payload });
}

export async function getPartyTransactions(partyId, recordType, options = {}) {
  const params = new URLSearchParams({ partyId });
  if (recordType) params.append('recordType', recordType);
  return client(`transactions/all?${params.toString()}`, { ...options });
}

export async function updateTransaction(id, payload) {
  return client(`transactions/update/${id}`, { method: 'PUT', body: payload });
}

export async function deleteTransaction(id) {
  return client(`transactions/delete/${id}`, { method: 'DELETE' });
}

export async function getCustomerBalance(customerId) {
  return client(`customers/${customerId}/balance`);
}

export async function getDashboardData() {
  return client('transactions/dashboard');
}
