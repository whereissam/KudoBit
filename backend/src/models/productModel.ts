import { db } from '../config/database.js'
import type { Product } from '../types/index.js'

export const productModel = {
  async create(creatorAddress: string, data: { name: string; description?: string; price_usdc: number; ipfs_hash?: string }): Promise<Product> {
    const { name, description, price_usdc, ipfs_hash } = data
    const result = await db.query(
      `INSERT INTO products (creator_address, name, description, price_usdc, ipfs_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [creatorAddress.toLowerCase(), name, description, price_usdc, ipfs_hash]
    )
    return result.rows[0]
  },

  async findById(id: number): Promise<Product | null> {
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async findAll(filters: { creator?: string } = {}): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE is_active = true'
    const params: unknown[] = []

    if (filters.creator) {
      params.push(filters.creator.toLowerCase())
      query += ` AND creator_address = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

    const result = await db.query(query, params)
    return result.rows
  },

  async findByCreator(creatorAddress: string): Promise<Product[]> {
    const result = await db.query(
      'SELECT * FROM products WHERE creator_address = $1 ORDER BY created_at DESC',
      [creatorAddress.toLowerCase()]
    )
    return result.rows
  },

  async update(id: number, data: { name?: string; description?: string; price_usdc?: number; ipfs_hash?: string; is_active?: boolean }): Promise<Product | undefined> {
    const { name, description, price_usdc, ipfs_hash, is_active } = data
    const result = await db.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price_usdc = COALESCE($3, price_usdc),
           ipfs_hash = COALESCE($4, ipfs_hash),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, description, price_usdc, ipfs_hash, is_active, id]
    )
    return result.rows[0]
  },

  async delete(id: number): Promise<void> {
    await db.query('DELETE FROM products WHERE id = $1', [id])
  }
}
