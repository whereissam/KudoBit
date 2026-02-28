import { db } from '../config/database.js'
import type { WishlistItem } from '../types/index.js'

export const WishlistModel = {
  async add(userAddress: string, productId: number): Promise<WishlistItem | null> {
    try {
      const result = await db.query(`
        INSERT INTO wishlists (user_address, product_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *
      `, [userAddress, productId])
      return result.rows[0] || null
    } catch {
      return null
    }
  },

  async remove(userAddress: string, productId: number): Promise<void> {
    await db.query(
      `DELETE FROM wishlists WHERE user_address = $1 AND product_id = $2`,
      [userAddress, productId]
    )
  },

  async findByUser(userAddress: string, { limit = 50, offset = 0 } = {}) {
    const result = await db.query(`
      SELECT w.*, p.*, c.display_name as creator_name
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      JOIN creators c ON p.creator_address = c.address
      WHERE w.user_address = $1 AND p.is_active = TRUE
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userAddress, limit, offset])
    return result.rows
  },

  async isInWishlist(userAddress: string, productId: number): Promise<boolean> {
    const result = await db.query(`
      SELECT EXISTS(
        SELECT 1 FROM wishlists
        WHERE user_address = $1 AND product_id = $2
      ) as is_wishlisted
    `, [userAddress, productId])
    return result.rows[0].is_wishlisted
  },

  async getCount(userAddress: string): Promise<number> {
    const result = await db.query(`
      SELECT COUNT(*) as count
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_address = $1 AND p.is_active = TRUE
    `, [userAddress])
    return parseInt(result.rows[0].count)
  }
}
