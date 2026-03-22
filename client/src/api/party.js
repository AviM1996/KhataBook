import client from './client';

export async function getParties({ recordType = 'CUSTOMER', page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({ recordType, page, limit });
  if (search?.trim()) params.append('search', search.trim());
  return client(`customers/all?${params.toString()}`);
}

export async function getPartyCard({ recordType = 'CUSTOMER' } = {}) {
  return client(`customers/card?${new URLSearchParams({ recordType }).toString()}`);
}

export async function createParty(payload) {
  return client('customers/add', { body: payload });
}

export async function updateParty(id, payload) {
  return client(`customers/update/${id}`, { method: 'PUT', body: payload });
}

export async function getPartyById(id) {
  return client(`customers/${id}`);
}

export async function deleteParty(id) {
  return client(`customers/${id}`, { method: 'DELETE' });
}
