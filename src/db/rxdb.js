import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

export async function createDatabase() {
  return await createRxDatabase({
    name: 'khatabookdb',
    storage: getRxStorageDexie(),
    // ignoreDuplicate: true,
  });
}
