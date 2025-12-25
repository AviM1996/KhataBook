import { initDb } from './initDb';

let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await initDb();
  }
  return dbInstance;
}
