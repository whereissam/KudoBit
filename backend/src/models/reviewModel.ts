import { db } from '../config/database.js'
import type { Review } from '../types/index.js'

export const ReviewModel = {
  async create(data: { productId: number; buyerAddress: string; purchaseId: number | null; rating: number; title?: string; comment?: string }): Promise<Review> {
    const result = await db.query(`
      INSERT INTO reviews (product_id, buyer_address, purchase_id, rating, title, comment, is_verified_purchase)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [data.productId, data.buyerAddress, data.purchaseId, data.rating, data.title, data.comment, !!data.purchaseId])
    return result.rows[0]
  },

  async findById(id: number): Promise<Review | undefined> {
    const result = await db.query(`SELECT * FROM reviews WHERE id = $1`, [id])
    return result.rows[0]
  },

  async findByProduct(productId: number, { limit = 20, offset = 0, sortBy = 'newest' } = {}) {
    const sortOptions: Record<string, string> = {
      'newest': 'created_at DESC',
      'oldest': 'created_at ASC',
      'highest': 'rating DESC',
      'lowest': 'rating ASC',
      'helpful': 'helpful_count DESC'
    }

    const result = await db.query(`
      SELECT r.*, c.display_name as reviewer_name
      FROM reviews r
      LEFT JOIN creators c ON r.buyer_address = c.address
      WHERE r.product_id = $1
      ORDER BY ${sortOptions[sortBy] || sortOptions.newest}
      LIMIT $2 OFFSET $3
    `, [productId, limit, offset])
    return result.rows
  },

  async findByUserAndProduct(buyerAddress: string, productId: number): Promise<Review | undefined> {
    const result = await db.query(
      `SELECT * FROM reviews WHERE buyer_address = $1 AND product_id = $2`,
      [buyerAddress, productId]
    )
    return result.rows[0]
  },

  async update(id: number, data: { rating?: number; title?: string; comment?: string }): Promise<Review | undefined> {
    const result = await db.query(`
      UPDATE reviews
      SET rating = COALESCE($2, rating),
          title = COALESCE($3, title),
          comment = COALESCE($4, comment),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, data.rating, data.title, data.comment])
    return result.rows[0]
  },

  async delete(id: number): Promise<void> {
    await db.query(`DELETE FROM reviews WHERE id = $1`, [id])
  },

  async markHelpful(reviewId: number, voterAddress: string): Promise<boolean> {
    try {
      await db.query(`
        INSERT INTO review_helpful (review_id, voter_address)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [reviewId, voterAddress])
      return true
    } catch {
      return false
    }
  },

  async getProductRatingSummary(productId: number) {
    const result = await db.query(`
      SELECT
        COUNT(*) as total_reviews,
        AVG(rating)::numeric(3,2) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE product_id = $1
    `, [productId])
    return result.rows[0]
  }
}
