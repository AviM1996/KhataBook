import { createDatabase } from './rxdb';
import { customerSchema } from './customer.schema';
import { transactionSchema } from './transaction.schema';

export async function initDb() {
  const db = await createDatabase();

  await db.addCollections({
    customers: {
      schema: customerSchema,
    },
    transactions: {
      schema: transactionSchema,
    },
  });

  return db;
}
