import { db } from '../config/database.js'
import type { Session } from '../types/index.js'

export const sessionModel = {
  async create(address: string, token: string, expiresAt: Date): Promise<Session> {
    const result = await db.query(
      `INSERT INTO sessions (address, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (address)
       DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at
       RETURNING *`,
      [address.toLowerCase(), token, expiresAt]
    )
    return result.rows[0]
  },

  async findByAddress(address: string): Promise<Session | null> {
    const result = await db.query(
      'SELECT * FROM sessions WHERE address = $1 AND expires_at > NOW()',
      [address.toLowerCase()]
    )
    return result.rows[0] || null
  },

  async delete(address: string): Promise<void> {
    await db.query('DELETE FROM sessions WHERE address = $1', [address.toLowerCase()])
  },

  async deleteExpired(): Promise<void> {
    await db.query('DELETE FROM sessions WHERE expires_at <= NOW()')
  }
}
