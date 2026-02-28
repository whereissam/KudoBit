import { AnalyticsModel } from '../models/analyticsModel.js'
import type { AppContext } from '../types/index.js'

export const AnalyticsController = {
  async getCreatorAnalytics(c: AppContext) {
    try {
      const { address } = c.req.param()
      const user = c.get('user')

      if (user.address.toLowerCase() !== address.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      const analytics = await AnalyticsModel.getCreatorAnalytics(address.toLowerCase())
      return c.json({ analytics })
    } catch (error) {
      console.error('Get creator analytics error:', error)
      return c.json({ error: 'Failed to fetch analytics' }, 500)
    }
  },

  async getCreatorSales(c: AppContext) {
    try {
      const { address } = c.req.param()
      const user = c.get('user')

      if (user.address.toLowerCase() !== address.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      const limit = parseInt(c.req.query('limit') || '50')
      const offset = parseInt(c.req.query('offset') || '0')
      const startDate = c.req.query('startDate')
      const endDate = c.req.query('endDate')

      const sales = await AnalyticsModel.getCreatorSales(address.toLowerCase(), {
        limit,
        offset,
        startDate,
        endDate
      })

      return c.json({
        sales,
        pagination: { limit, offset, hasMore: sales.length === limit }
      })
    } catch (error) {
      console.error('Get creator sales error:', error)
      return c.json({ error: 'Failed to fetch sales' }, 500)
    }
  },

  async getRevenueOverTime(c: AppContext) {
    try {
      const { address } = c.req.param()
      const user = c.get('user')

      if (user.address.toLowerCase() !== address.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      const days = parseInt(c.req.query('days') || '30')
      const data = await AnalyticsModel.getRevenueOverTime(address.toLowerCase(), { days })

      return c.json({ data })
    } catch (error) {
      console.error('Get revenue error:', error)
      return c.json({ error: 'Failed to fetch revenue data' }, 500)
    }
  },

  async getTopProducts(c: AppContext) {
    try {
      const { address } = c.req.param()
      const user = c.get('user')

      if (user.address.toLowerCase() !== address.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      const limit = parseInt(c.req.query('limit') || '10')
      const products = await AnalyticsModel.getTopProducts(address.toLowerCase(), { limit })

      return c.json({ products })
    } catch (error) {
      console.error('Get top products error:', error)
      return c.json({ error: 'Failed to fetch top products' }, 500)
    }
  },

  async getProductAnalytics(c: AppContext) {
    try {
      const { id } = c.req.param()
      const analytics = await AnalyticsModel.getProductAnalytics(parseInt(id))
      return c.json({ analytics })
    } catch (error) {
      console.error('Get product analytics error:', error)
      return c.json({ error: 'Failed to fetch product analytics' }, 500)
    }
  }
}
