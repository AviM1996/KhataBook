import client from './client';

export async function createCustomer(payload) {
  return client('/customers', { body: payload });
}

export async function updateCustomer(id, payload) {
  return client(`/customers/${id}`, { method: 'PUT', body: payload });
}

export async function getCustomerById(id) {
  return client(`/customers/${id}`);
}

export async function getCustomers(role) {
  return client(`/customers?role=${role}`);
}

export async function softDeleteCustomer(id) {
  return client(`/customers/${id}`, { method: 'DELETE' });
}
