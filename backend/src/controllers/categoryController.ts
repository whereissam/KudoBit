import { CategoryModel } from '../models/categoryModel.js'
import type { AppContext } from '../types/index.js'

export const CategoryController = {
  async getAll(c: AppContext) {
    try {
      const categories = await CategoryModel.findAll()
      return c.json({ categories })
    } catch (error) {
      console.error('Get categories error:', error)
      return c.json({ error: 'Failed to fetch categories' }, 500)
    }
  },

  async getBySlug(c: AppContext) {
    try {
      const { slug } = c.req.param()
      const category = await CategoryModel.findBySlug(slug)

      if (!category) {
        return c.json({ error: 'Category not found' }, 404)
      }

      const stats = await CategoryModel.getStats(category.id)

      return c.json({
        category: {
          ...category,
          ...stats
        }
      })
    } catch (error) {
      console.error('Get category error:', error)
      return c.json({ error: 'Failed to fetch category' }, 500)
    }
  },

  async getProducts(c: AppContext) {
    try {
      const { slug } = c.req.param()
      const limit = parseInt(c.req.query('limit') || '20')
      const offset = parseInt(c.req.query('offset') || '0')

      const category = await CategoryModel.findBySlug(slug)

      if (!category) {
        return c.json({ error: 'Category not found' }, 404)
      }

      const products = await CategoryModel.getProducts(category.id, { limit, offset })

      return c.json({
        products,
        pagination: { limit, offset, hasMore: products.length === limit }
      })
    } catch (error) {
      console.error('Get category products error:', error)
      return c.json({ error: 'Failed to fetch products' }, 500)
    }
  }
}
