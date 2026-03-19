import client from './client';

export async function getSuppliers() {
  return client('suppliers');
}

export async function createSupplier(payload) {
  return client('suppliers', { body: payload });
}

export async function updateSupplier(id, payload) {
  return client(`suppliers/${id}`, { method: 'PUT', body: payload });
}

export async function deleteSupplier(id) {
  return client(`suppliers/${id}`, { method: 'DELETE' });
}
