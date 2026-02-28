import { ReviewModel } from '../models/reviewModel.js'
import type { AppContext } from '../types/index.js'

export const ReviewController = {
  async create(c: AppContext) {
    try {
      const { id } = c.req.param()
      const user = c.get('user')
      const { rating, title, comment, purchaseId } = await c.req.json()

      if (!rating || rating < 1 || rating > 5) {
        return c.json({ error: 'Rating must be between 1 and 5' }, 400)
      }

      const existing = await ReviewModel.findByUserAndProduct(user.address, parseInt(id))
      if (existing) {
        return c.json({ error: 'You have already reviewed this product' }, 409)
      }

      const review = await ReviewModel.create({
        productId: parseInt(id),
        buyerAddress: user.address,
        purchaseId: purchaseId || null,
        rating,
        title,
        comment
      })

      return c.json({ review }, 201)
    } catch (error) {
      console.error('Create review error:', error)
      return c.json({ error: 'Failed to create review' }, 500)
    }
  },

  async getByProduct(c: AppContext) {
    try {
      const { id } = c.req.param()
      const limit = parseInt(c.req.query('limit') || '20')
      const offset = parseInt(c.req.query('offset') || '0')
      const sortBy = c.req.query('sortBy') || 'newest'

      const reviews = await ReviewModel.findByProduct(parseInt(id), { limit, offset, sortBy })
      const summary = await ReviewModel.getProductRatingSummary(parseInt(id))

      return c.json({
        reviews,
        summary,
        pagination: { limit, offset, hasMore: reviews.length === limit }
      })
    } catch (error) {
      console.error('Get reviews error:', error)
      return c.json({ error: 'Failed to fetch reviews' }, 500)
    }
  },

  async update(c: AppContext) {
    try {
      const { id } = c.req.param()
      const user = c.get('user')
      const { rating, title, comment } = await c.req.json()

      const existing = await ReviewModel.findById(parseInt(id))
      if (!existing) {
        return c.json({ error: 'Review not found' }, 404)
      }
      if (existing.buyer_address !== user.address) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      const review = await ReviewModel.update(parseInt(id), { rating, title, comment })
      return c.json({ review })
    } catch (error) {
      console.error('Update review error:', error)
      return c.json({ error: 'Failed to update review' }, 500)
    }
  },

  async delete(c: AppContext) {
    try {
      const { id } = c.req.param()
      const user = c.get('user')

      const existing = await ReviewModel.findById(parseInt(id))
      if (!existing) {
        return c.json({ error: 'Review not found' }, 404)
      }
      if (existing.buyer_address !== user.address) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      await ReviewModel.delete(parseInt(id))
      return c.json({ success: true })
    } catch (error) {
      console.error('Delete review error:', error)
      return c.json({ error: 'Failed to delete review' }, 500)
    }
  },

  async markHelpful(c: AppContext) {
    try {
      const { id } = c.req.param()
      const user = c.get('user')

      const success = await ReviewModel.markHelpful(parseInt(id), user.address)
      return c.json({ success })
    } catch (error) {
      console.error('Mark helpful error:', error)
      return c.json({ error: 'Failed to mark review as helpful' }, 500)
    }
  }
}
