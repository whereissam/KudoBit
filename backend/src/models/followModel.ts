import { db } from '../config/database.js'
import type { Follow } from '../types/index.js'

export const FollowModel = {
  async follow(followerAddress: string, creatorAddress: string): Promise<Follow | null> {
    try {
      const result = await db.query(`
        INSERT INTO follows (follower_address, creator_address)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *
      `, [followerAddress, creatorAddress])
      return result.rows[0] || null
    } catch {
      return null
    }
  },

  async unfollow(followerAddress: string, creatorAddress: string): Promise<void> {
    await db.query(
      `DELETE FROM follows WHERE follower_address = $1 AND creator_address = $2`,
      [followerAddress, creatorAddress]
    )
  },

  async isFollowing(followerAddress: string, creatorAddress: string): Promise<boolean> {
    const result = await db.query(`
      SELECT EXISTS(
        SELECT 1 FROM follows
        WHERE follower_address = $1 AND creator_address = $2
      ) as is_following
    `, [followerAddress, creatorAddress])
    return result.rows[0].is_following
  },

  async getFollowers(creatorAddress: string, { limit = 50, offset = 0 } = {}) {
    const result = await db.query(`
      SELECT f.follower_address, c.display_name, c.bio, f.created_at
      FROM follows f
      LEFT JOIN creators c ON f.follower_address = c.address
      WHERE f.creator_address = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `, [creatorAddress, limit, offset])
    return result.rows
  },

  async getFollowing(userAddress: string, { limit = 50, offset = 0 } = {}) {
    const result = await db.query(`
      SELECT f.creator_address, c.display_name, c.bio, f.created_at
      FROM follows f
      JOIN creators c ON f.creator_address = c.address
      WHERE f.follower_address = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userAddress, limit, offset])
    return result.rows
  },

  async getCounts(address: string): Promise<{ followers: string; following: string }> {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM follows WHERE creator_address = $1) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_address = $1) as following
    `, [address])
    return result.rows[0]
  }
}
