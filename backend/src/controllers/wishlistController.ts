import { WishlistModel } from '../models/wishlistModel.js'
import type { AppContext } from '../types/index.js'

export const WishlistController = {
  async get(c: AppContext) {
    try {
      const user = c.get('user')
      const limit = parseInt(c.req.query('limit') || '50')
      const offset = parseInt(c.req.query('offset') || '0')

      const items = await WishlistModel.findByUser(user.address, { limit, offset })
      const count = await WishlistModel.getCount(user.address)

      return c.json({
        items,
        count,
        pagination: { limit, offset, hasMore: items.length === limit }
      })
    } catch (error) {
      console.error('Get wishlist error:', error)
      return c.json({ error: 'Failed to fetch wishlist' }, 500)
    }
  },

  async add(c: AppContext) {
    try {
      const user = c.get('user')
      const { productId } = c.req.param()

      const item = await WishlistModel.add(user.address, parseInt(productId))
      return c.json({ item }, 201)
    } catch (error) {
      console.error('Add to wishlist error:', error)
      return c.json({ error: 'Failed to add to wishlist' }, 500)
    }
  },

  async remove(c: AppContext) {
    try {
      const user = c.get('user')
      const { productId } = c.req.param()

      await WishlistModel.remove(user.address, parseInt(productId))
      return c.json({ success: true })
    } catch (error) {
      console.error('Remove from wishlist error:', error)
      return c.json({ error: 'Failed to remove from wishlist' }, 500)
    }
  },

  async check(c: AppContext) {
    try {
      const user = c.get('user')
      const { productId } = c.req.param()

      const isWishlisted = await WishlistModel.isInWishlist(user.address, parseInt(productId))
      return c.json({ isWishlisted })
    } catch (error) {
      console.error('Check wishlist error:', error)
      return c.json({ error: 'Failed to check wishlist' }, 500)
    }
  }
}
