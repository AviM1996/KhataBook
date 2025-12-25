import { getDb } from './index';

export async function addCustomer(data) {
  const db = await getDb();

  return db.customers.insert({
    id: data.id,
    name: data.name,
    phone: data.phone,
    address: data.address || '',
    createdAt: new Date().toISOString(),
  });
}

export async function getAllCustomers() {
  const db = await getDb();
  const docs = await db.customers.find().exec();
  return docs.map(d => d.toJSON());
}

export async function getCustomerById(id) {
  const db = await getDb();

  const doc = await db.customers
    .findOne({
      selector: { id },
    })
    .exec();

  return doc ? doc.toJSON() : null;
}