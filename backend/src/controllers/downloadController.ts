import { DownloadModel } from '../models/downloadModel.js'
import { db } from '../config/database.js'
import { config } from '../config/env.js'
import type { AppContext } from '../types/index.js'

export const DownloadController = {
  async createDownloadLink(c: AppContext) {
    try {
      const { id } = c.req.param()
      const user = c.get('user')

      const purchase = await db.query(
        `SELECT * FROM purchases WHERE id = $1 AND buyer_address = $2`,
        [parseInt(id), user.address]
      )

      if (purchase.rows.length === 0) {
        return c.json({ error: 'Purchase not found' }, 404)
      }

      const downloadLink = await DownloadModel.createDownloadLink(
        parseInt(id),
        user.address,
        purchase.rows[0].product_id
      )

      return c.json({
        downloadUrl: `/api/downloads/${downloadLink.download_url}`,
        expiresAt: downloadLink.expires_at
      }, 201)
    } catch (error) {
      console.error('Create download link error:', error)
      return c.json({ error: 'Failed to create download link' }, 500)
    }
  },

  async download(c: AppContext) {
    try {
      const { token } = c.req.param()

      const download = await DownloadModel.verifyDownloadLink(token)

      if (!download) {
        return c.json({ error: 'Invalid or expired download link' }, 404)
      }

      const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
      const userAgent = c.req.header('user-agent') || 'unknown'
      await DownloadModel.markDownloaded(download.id, ipAddress, userAgent)

      return c.json({
        ipfsHash: download.ipfs_hash,
        productName: download.product_name,
        gateway: `https://${config.ipfs.gateway}/ipfs/`
      })
    } catch (error) {
      console.error('Download error:', error)
      return c.json({ error: 'Download failed' }, 500)
    }
  },

  async getDownloadHistory(c: AppContext) {
    try {
      const user = c.get('user')
      const limit = parseInt(c.req.query('limit') || '50')
      const offset = parseInt(c.req.query('offset') || '0')

      const downloads = await DownloadModel.getUserDownloads(user.address, { limit, offset })

      return c.json({
        downloads,
        pagination: { limit, offset, hasMore: downloads.length === limit }
      })
    } catch (error) {
      console.error('Get download history error:', error)
      return c.json({ error: 'Failed to fetch download history' }, 500)
    }
  },

  async getProductDownloadStats(c: AppContext) {
    try {
      const { id } = c.req.param()
      const stats = await DownloadModel.getProductDownloadStats(parseInt(id))
      return c.json({ stats })
    } catch (error) {
      console.error('Get download stats error:', error)
      return c.json({ error: 'Failed to fetch download stats' }, 500)
    }
  }
}
