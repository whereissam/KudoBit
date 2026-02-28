import { TagModel } from '../models/tagModel.js'
import type { AppContext } from '../types/index.js'

export const TagController = {
  async getAll(c: AppContext) {
    try {
      const tags = await TagModel.findAll()
      return c.json({ tags })
    } catch (error) {
      console.error('Get tags error:', error)
      return c.json({ error: 'Failed to fetch tags' }, 500)
    }
  },

  async getPopular(c: AppContext) {
    try {
      const limit = parseInt(c.req.query('limit') || '20')
      const tags = await TagModel.getPopular(limit)
      return c.json({ tags })
    } catch (error) {
      console.error('Get popular tags error:', error)
      return c.json({ error: 'Failed to fetch popular tags' }, 500)
    }
  },

  async getProducts(c: AppContext) {
    try {
      const { slug } = c.req.param()
      const limit = parseInt(c.req.query('limit') || '20')
      const offset = parseInt(c.req.query('offset') || '0')

      const tag = await TagModel.findBySlug(slug)
      if (!tag) {
        return c.json({ error: 'Tag not found' }, 404)
      }

      const products = await TagModel.getProducts(tag.id, { limit, offset })
      return c.json({ products, pagination: { limit, offset, hasMore: products.length === limit } })
    } catch (error) {
      console.error('Get tag products error:', error)
      return c.json({ error: 'Failed to fetch products' }, 500)
    }
  }
}
