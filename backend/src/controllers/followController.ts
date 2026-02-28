import { FollowModel } from '../models/followModel.js'
import type { AppContext } from '../types/index.js'

export const FollowController = {
  async follow(c: AppContext) {
    try {
      const user = c.get('user')
      const { address } = c.req.param()

      if (user.address.toLowerCase() === address.toLowerCase()) {
        return c.json({ error: 'Cannot follow yourself' }, 400)
      }

      const follow = await FollowModel.follow(user.address, address.toLowerCase())
      return c.json({ follow }, 201)
    } catch (error) {
      console.error('Follow error:', error)
      return c.json({ error: 'Failed to follow creator' }, 500)
    }
  },

  async unfollow(c: AppContext) {
    try {
      const user = c.get('user')
      const { address } = c.req.param()

      await FollowModel.unfollow(user.address, address.toLowerCase())
      return c.json({ success: true })
    } catch (error) {
      console.error('Unfollow error:', error)
      return c.json({ error: 'Failed to unfollow creator' }, 500)
    }
  },

  async getFollowers(c: AppContext) {
    try {
      const { address } = c.req.param()
      const limit = parseInt(c.req.query('limit') || '50')
      const offset = parseInt(c.req.query('offset') || '0')

      const followers = await FollowModel.getFollowers(address.toLowerCase(), { limit, offset })
      return c.json({
        followers,
        pagination: { limit, offset, hasMore: followers.length === limit }
      })
    } catch (error) {
      console.error('Get followers error:', error)
      return c.json({ error: 'Failed to fetch followers' }, 500)
    }
  },

  async getFollowing(c: AppContext) {
    try {
      const user = c.get('user')
      const limit = parseInt(c.req.query('limit') || '50')
      const offset = parseInt(c.req.query('offset') || '0')

      const following = await FollowModel.getFollowing(user.address, { limit, offset })
      return c.json({
        following,
        pagination: { limit, offset, hasMore: following.length === limit }
      })
    } catch (error) {
      console.error('Get following error:', error)
      return c.json({ error: 'Failed to fetch following' }, 500)
    }
  },

  async checkFollowing(c: AppContext) {
    try {
      const user = c.get('user')
      const { address } = c.req.param()

      const isFollowing = await FollowModel.isFollowing(user.address, address.toLowerCase())
      return c.json({ isFollowing })
    } catch (error) {
      console.error('Check following error:', error)
      return c.json({ error: 'Failed to check following status' }, 500)
    }
  },

  async getStats(c: AppContext) {
    try {
      const { address } = c.req.param()
      const stats = await FollowModel.getCounts(address.toLowerCase())
      return c.json({ stats })
    } catch (error) {
      console.error('Get stats error:', error)
      return c.json({ error: 'Failed to fetch stats' }, 500)
    }
  }
}
