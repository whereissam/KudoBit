import { db } from '../config/database.js'
import type { Creator } from '../types/index.js'

export const creatorModel = {
  async findByAddress(address: string): Promise<Creator | null> {
    const result = await db.query(
      'SELECT * FROM creators WHERE address = $1',
      [address.toLowerCase()]
    )
    return result.rows[0] || null
  },

  async create(address: string): Promise<Creator | undefined> {
    const result = await db.query(
      'INSERT INTO creators (address) VALUES ($1) ON CONFLICT (address) DO NOTHING RETURNING *',
      [address.toLowerCase()]
    )
    return result.rows[0]
  },

  async update(address: string, data: { display_name?: string; bio?: string; social_links?: Record<string, string> }): Promise<Creator | undefined> {
    const { display_name, bio, social_links } = data
    const result = await db.query(
      `UPDATE creators
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           social_links = COALESCE($3, social_links),
           updated_at = CURRENT_TIMESTAMP
       WHERE address = $4
       RETURNING *`,
      [display_name, bio, social_links, address.toLowerCase()]
    )
    return result.rows[0]
  },

  async findAll(): Promise<Pick<Creator, 'address' | 'display_name' | 'bio' | 'created_at'>[]> {
    const result = await db.query(
      'SELECT address, display_name, bio, created_at FROM creators ORDER BY created_at DESC'
    )
    return result.rows
  }
}
