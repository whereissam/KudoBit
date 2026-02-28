import { db } from '../config/database.js'
import crypto from 'crypto'
import type { Download } from '../types/index.js'

export const DownloadModel = {
  async createDownloadLink(purchaseId: number, buyerAddress: string, productId: number): Promise<Download> {
    const downloadUrl = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const result = await db.query(`
      INSERT INTO downloads (purchase_id, buyer_address, product_id, download_url, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [purchaseId, buyerAddress, productId, downloadUrl, expiresAt])

    return result.rows[0]
  },

  async verifyDownloadLink(downloadUrl: string): Promise<(Download & { ipfs_hash: string | null; product_name: string }) | undefined> {
    const result = await db.query(`
      SELECT d.*, p.ipfs_hash, p.name as product_name
      FROM downloads d
      JOIN products p ON d.product_id = p.id
      WHERE d.download_url = $1
        AND d.expires_at > NOW()
        AND d.downloaded_at IS NULL
    `, [downloadUrl])

    return result.rows[0]
  },

  async markDownloaded(downloadId: number, ipAddress: string, userAgent: string): Promise<void> {
    await db.query(`
      UPDATE downloads
      SET downloaded_at = NOW(),
          ip_address = $2,
          user_agent = $3
      WHERE id = $1
    `, [downloadId, ipAddress, userAgent])
  },

  async getUserDownloads(buyerAddress: string, { limit = 50, offset = 0 } = {}) {
    const result = await db.query(`
      SELECT d.*, p.name as product_name, p.ipfs_hash
      FROM downloads d
      JOIN products p ON d.product_id = p.id
      WHERE d.buyer_address = $1
      ORDER BY d.created_at DESC
      LIMIT $2 OFFSET $3
    `, [buyerAddress, limit, offset])
    return result.rows
  },

  async getProductDownloadStats(productId: number) {
    const result = await db.query(`
      SELECT
        COUNT(*) as total_downloads,
        COUNT(CASE WHEN downloaded_at IS NOT NULL THEN 1 END) as completed_downloads,
        COUNT(DISTINCT buyer_address) as unique_downloaders
      FROM downloads
      WHERE product_id = $1
    `, [productId])
    return result.rows[0]
  }
}
