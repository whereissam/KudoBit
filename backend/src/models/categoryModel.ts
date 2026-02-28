import { db } from '../config/database.js'
import type { Category, Product } from '../types/index.js'

export const CategoryModel = {
  async findAll(): Promise<Category[]> {
    const result = await db.query(`SELECT * FROM categories ORDER BY name ASC`)
    return result.rows
  },

  async findById(id: number): Promise<Category | undefined> {
    const result = await db.query(`SELECT * FROM categories WHERE id = $1`, [id])
    return result.rows[0]
  },

  async findBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.query(`SELECT * FROM categories WHERE slug = $1`, [slug])
    return result.rows[0]
  },

  async create(data: { name: string; slug: string; description?: string }): Promise<Category> {
    const result = await db.query(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.slug, data.description]
    )
    return result.rows[0]
  },

  async getProducts(categoryId: number, { limit = 20, offset = 0 } = {}): Promise<(Product & { creator_name: string })[]> {
    const result = await db.query(
      `SELECT p.*, c.display_name as creator_name
       FROM products p
       JOIN product_categories pc ON p.id = pc.product_id
       JOIN creators c ON p.creator_address = c.address
       WHERE pc.category_id = $1 AND p.is_active = TRUE
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [categoryId, limit, offset]
    )
    return result.rows
  },

  async getStats(categoryId: number): Promise<{ product_count: string; creator_count: string }> {
    const result = await db.query(
      `SELECT
        COUNT(DISTINCT pc.product_id) as product_count,
        COUNT(DISTINCT p.creator_address) as creator_count
       FROM product_categories pc
       LEFT JOIN products p ON pc.product_id = p.id
       WHERE pc.category_id = $1 AND p.is_active = TRUE`,
      [categoryId]
    )
    return result.rows[0]
  }
}
