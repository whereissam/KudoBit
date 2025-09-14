import { dbSQLite as db } from '../database-sqlite.js';

export const authModel = {
  createSession: async (address, token, expiresAt) => {
    const result = await db.run(
      'INSERT INTO sessions (address, token, expires_at) VALUES (?, ?, ?)',
      [address, token, expiresAt]
    );
    return { id: result.lastID, address, token, expiresAt };
  },

  deleteSession: async (address) => {
    await db.run('DELETE FROM sessions WHERE address = ?', [address]);
  },

  findSessionByToken: async (token) => {
    return await db.get('SELECT * FROM sessions WHERE token = ?', [token]);
  }
};