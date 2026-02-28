import { db } from '../config/database.js'

interface SearchParams {
  query: string
  category?: number
  tags?: number[]
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  limit?: number
  offset?: number
}

export const SearchModel = {
  async searchProducts({ query, category, tags, minPrice, maxPrice, sortBy = 'relevance', limit = 20, offset = 0 }: SearchParams) {
    let sql = `
      SELECT DISTINCT p.*, c.display_name as creator_name,
        ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', $1)) as rank
      FROM products p
      JOIN creators c ON p.creator_address = c.address
    `

    const conditions = ['p.is_active = TRUE']
    const params: unknown[] = [query]
    let paramIndex = 2

    if (query) {
      conditions.push(`(
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, ''))
        @@ plainto_tsquery('english', $1)
      )`)
    }

    if (category) {
      sql += ` JOIN product_categories pc ON p.id = pc.product_id`
      conditions.push(`pc.category_id = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }

    if (tags && tags.length > 0) {
      sql += ` JOIN product_tags pt ON p.id = pt.product_id`
      conditions.push(`pt.tag_id = ANY($${paramIndex})`)
      params.push(tags)
      paramIndex++
    }

    if (minPrice !== undefined) {
      conditions.push(`p.price_usdc >= $${paramIndex}`)
      params.push(minPrice)
      paramIndex++
    }

    if (maxPrice !== undefined) {
      conditions.push(`p.price_usdc <= $${paramIndex}`)
      params.push(maxPrice)
      paramIndex++
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ')
    }

    const sortOptions: Record<string, string> = {
      'relevance': 'rank DESC',
      'newest': 'p.created_at DESC',
      'oldest': 'p.created_at ASC',
      'price_asc': 'p.price_usdc ASC',
      'price_desc': 'p.price_usdc DESC',
      'name': 'p.name ASC'
    }

    sql += ` ORDER BY ${sortOptions[sortBy] || sortOptions.relevance}`
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await db.query(sql, params)
    return result.rows
  },

  async getTrendingProducts({ limit = 20, days = 7 } = {}) {
    const result = await db.query(`
      SELECT p.*, c.display_name as creator_name,
        pa.view_count,
        COUNT(pu.id) as purchase_count
      FROM products p
      JOIN creators c ON p.creator_address = c.address
      LEFT JOIN product_analytics pa ON p.id = pa.product_id
      LEFT JOIN purchases pu ON p.id = pu.product_id
        AND pu.created_at > NOW() - make_interval(days => $2)
      WHERE p.is_active = TRUE
      GROUP BY p.id, c.display_name, pa.view_count
      ORDER BY purchase_count DESC, pa.view_count DESC
      LIMIT $1
    `, [limit, days])
    return result.rows
  },

  async getFeaturedProducts({ limit = 10 } = {}) {
    const result = await db.query(`
      SELECT p.*, c.display_name as creator_name,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count
      FROM products p
      JOIN creators c ON p.creator_address = c.address
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.is_active = TRUE
      GROUP BY p.id, c.display_name
      HAVING COUNT(r.id) > 0
      ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC
      LIMIT $1
    `, [limit])
    return result.rows
  }
}
