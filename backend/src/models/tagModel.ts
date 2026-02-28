import { db } from '../config/database.js'
import type { Tag, Product } from '../types/index.js'

export const TagModel = {
  async findAll(): Promise<Tag[]> {
    const result = await db.query(`SELECT * FROM tags ORDER BY name ASC`)
    return result.rows
  },

  async findById(id: number): Promise<Tag | undefined> {
    const result = await db.query(`SELECT * FROM tags WHERE id = $1`, [id])
    return result.rows[0]
  },

  async findBySlug(slug: string): Promise<Tag | undefined> {
    const result = await db.query(`SELECT * FROM tags WHERE slug = $1`, [slug])
    return result.rows[0]
  },

  async createOrGet(data: { name: string; slug: string }): Promise<Tag> {
    const result = await db.query(
      `INSERT INTO tags (name, slug) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = $1
       RETURNING *`,
      [data.name, data.slug]
    )
    return result.rows[0]
  },

  async getProducts(tagId: number, { limit = 20, offset = 0 } = {}): Promise<(Product & { creator_name: string })[]> {
    const result = await db.query(
      `SELECT p.*, c.display_name as creator_name
       FROM products p
       JOIN product_tags pt ON p.id = pt.product_id
       JOIN creators c ON p.creator_address = c.address
       WHERE pt.tag_id = $1 AND p.is_active = TRUE
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [tagId, limit, offset]
    )
    return result.rows
  },

  async getPopular(limit = 20): Promise<(Tag & { product_count: string })[]> {
    const result = await db.query(
      `SELECT t.*, COUNT(pt.product_id) as product_count
       FROM tags t
       LEFT JOIN product_tags pt ON t.id = pt.tag_id
       GROUP BY t.id
       ORDER BY product_count DESC, t.name ASC
       LIMIT $1`,
      [limit]
    )
    return result.rows
  }
}
