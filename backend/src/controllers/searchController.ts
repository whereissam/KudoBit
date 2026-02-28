import { SearchModel } from '../models/searchModel.js'
import { AnalyticsModel } from '../models/analyticsModel.js'
import type { AppContext } from '../types/index.js'

export const SearchController = {
  async search(c: AppContext) {
    try {
      const body = await c.req.json()
      const { query, category, tags, minPrice, maxPrice, sortBy, limit, offset } = body

      const products = await SearchModel.searchProducts({
        query,
        category,
        tags,
        minPrice,
        maxPrice,
        sortBy,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0
      })

      return c.json({
        products,
        pagination: {
          limit: parseInt(limit) || 20,
          offset: parseInt(offset) || 0,
          hasMore: products.length === (parseInt(limit) || 20)
        }
      })
    } catch (error) {
      console.error('Search error:', error)
      return c.json({ error: 'Search failed' }, 500)
    }
  },

  async getTrending(c: AppContext) {
    try {
      const limit = parseInt(c.req.query('limit') || '20')
      const days = parseInt(c.req.query('days') || '7')

      const products = await SearchModel.getTrendingProducts({ limit, days })
      return c.json({ products })
    } catch (error) {
      console.error('Get trending error:', error)
      return c.json({ error: 'Failed to fetch trending products' }, 500)
    }
  },

  async getFeatured(c: AppContext) {
    try {
      const limit = parseInt(c.req.query('limit') || '10')
      const products = await SearchModel.getFeaturedProducts({ limit })
      return c.json({ products })
    } catch (error) {
      console.error('Get featured error:', error)
      return c.json({ error: 'Failed to fetch featured products' }, 500)
    }
  },

  async trackView(c: AppContext) {
    try {
      const { id } = c.req.param()
      await AnalyticsModel.trackProductView(parseInt(id))
      return c.json({ success: true })
    } catch (error) {
      console.error('Track view error:', error)
      return c.json({ error: 'Failed to track view' }, 500)
    }
  }
}
