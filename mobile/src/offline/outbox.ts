import * as SQLite from 'expo-sqlite';
import { api, ApiError } from '../api/client';

export interface OutboxItem {
  id: string;
  entityType: 'activity' | 'task' | 'journal' | 'knowledge';
  action: 'create' | 'update';
  payload: Record<string, unknown>;
  createdAt: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function db() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await SQLite.openDatabaseAsync('lifeos.db');
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS outbox (
          id TEXT PRIMARY KEY NOT NULL,
          entityType TEXT NOT NULL,
          action TEXT NOT NULL,
          payload TEXT NOT NULL,
          createdAt TEXT NOT NULL
        );
      `);
      return database;
    })();
  }
  return dbPromise;
}

export async function enqueue(item: OutboxItem) {
  const database = await db();
  await database.runAsync(
    'INSERT OR REPLACE INTO outbox (id, entityType, action, payload, createdAt) VALUES (?, ?, ?, ?, ?)',
    item.id,
    item.entityType,
    item.action,
    JSON.stringify(item.payload),
    item.createdAt,
  );
}

export async function pending(): Promise<OutboxItem[]> {
  const database = await db();
  const rows = await database.getAllAsync<{
    id: string;
    entityType: OutboxItem['entityType'];
    action: OutboxItem['action'];
    payload: string;
    createdAt: string;
  }>('SELECT * FROM outbox ORDER BY createdAt ASC');
  return rows.map((row) => ({ ...row, payload: JSON.parse(row.payload) as Record<string, unknown> }));
}

export async function remove(id: string) {
  const database = await db();
  await database.runAsync('DELETE FROM outbox WHERE id = ?', id);
}

export async function flushOutbox() {
  const items = await pending();
  if (!items.length) {
    return { flushed: 0 };
  }
  try {
    const result = await api<{ results: Array<{ clientId: string; success: boolean }> }>('/sync/push', {
      method: 'POST',
      body: JSON.stringify({
        operations: items.map((item) => ({
          clientId: item.id,
          entityType: item.entityType,
          action: item.action,
          payload: item.payload,
        })),
      }),
    });
    for (const item of result.results) {
      if (item.success) {
        await remove(item.clientId);
      }
    }
    return { flushed: result.results.filter((item) => item.success).length };
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NETWORK') {
      return { flushed: 0, offline: true };
    }
    throw error;
  }
}
