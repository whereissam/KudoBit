import { db } from '../config/database.js'
import type { CreatorAnalyticsRow } from '../types/index.js'

export const AnalyticsModel = {
  async getCreatorAnalytics(creatorAddress: string): Promise<CreatorAnalyticsRow> {
    const result = await db.query(
      `SELECT * FROM creator_analytics WHERE creator_address = $1`,
      [creatorAddress]
    )

    if (result.rows.length === 0) {
      return {
        creator_address: creatorAddress,
        total_sales: 0,
        total_revenue_usdc: '0',
        total_products: 0,
        total_followers: 0,
        avg_rating: null,
        total_reviews: 0,
        last_sale_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    return result.rows[0]
  },

  async getCreatorSales(creatorAddress: string, { limit = 50, offset = 0, startDate, endDate }: { limit?: number; offset?: number; startDate?: string; endDate?: string } = {}) {
    let sql = `
      SELECT pu.*, p.name as product_name, p.price_usdc
      FROM purchases pu
      JOIN products p ON pu.product_id = p.id
      WHERE p.creator_address = $1
    `

    const params: unknown[] = [creatorAddress]
    let paramIndex = 2

    if (startDate) {
      sql += ` AND pu.created_at >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      sql += ` AND pu.created_at <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    sql += ` ORDER BY pu.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await db.query(sql, params)
    return result.rows
  },

  async getProductAnalytics(productId: number) {
    const result = await db.query(`
      SELECT
        pa.*,
        COUNT(pu.id) as total_purchases,
        COALESCE(SUM(pu.price_usdc), 0) as total_revenue,
        AVG(r.rating)::numeric(3,2) as avg_rating,
        COUNT(r.id) as review_count
      FROM product_analytics pa
      LEFT JOIN purchases pu ON pa.product_id = pu.product_id
      LEFT JOIN reviews r ON pa.product_id = r.product_id
      WHERE pa.product_id = $1
      GROUP BY pa.id
    `, [productId])

    if (result.rows.length === 0) {
      return {
        product_id: productId,
        view_count: 0,
        download_count: 0,
        total_purchases: 0,
        total_revenue: '0',
        avg_rating: null,
        review_count: 0
      }
    }

    return result.rows[0]
  },

  async trackProductView(productId: number): Promise<void> {
    await db.query(`
      INSERT INTO product_analytics (product_id, view_count, last_viewed_at, updated_at)
      VALUES ($1, 1, NOW(), NOW())
      ON CONFLICT (product_id) DO UPDATE SET
        view_count = product_analytics.view_count + 1,
        last_viewed_at = NOW(),
        updated_at = NOW()
    `, [productId])
  },

  async getRevenueOverTime(creatorAddress: string, { days = 30 } = {}) {
    const result = await db.query(`
      SELECT
        DATE(pu.created_at) as date,
        COUNT(*) as sales,
        SUM(pu.price_usdc) as revenue
      FROM purchases pu
      JOIN products p ON pu.product_id = p.id
      WHERE p.creator_address = $1
        AND pu.created_at > NOW() - make_interval(days => $2)
      GROUP BY DATE(pu.created_at)
      ORDER BY date ASC
    `, [creatorAddress, days])
    return result.rows
  },

  async getTopProducts(creatorAddress: string, { limit = 10 } = {}) {
    const result = await db.query(`
      SELECT
        p.*,
        COUNT(pu.id) as total_sales,
        SUM(pu.price_usdc) as total_revenue,
        AVG(r.rating)::numeric(3,2) as avg_rating
      FROM products p
      LEFT JOIN purchases pu ON p.id = pu.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.creator_address = $1
      GROUP BY p.id
      ORDER BY total_sales DESC, total_revenue DESC
      LIMIT $2
    `, [creatorAddress, limit])
    return result.rows
  }
}
