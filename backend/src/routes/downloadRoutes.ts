import { Hono } from 'hono'
import { DownloadController } from '../controllers/downloadController.js'
import { requireAuth } from '../middleware/auth.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

// Create download link (protected)
router.post('/purchases/:id/download', requireAuth, DownloadController.createDownloadLink)

// Download file (public with token)
router.get('/downloads/:token', DownloadController.download)

// Download history (protected)
router.get('/downloads', requireAuth, DownloadController.getDownloadHistory)

// Download stats (public)
router.get('/products/:id/download-stats', DownloadController.getProductDownloadStats)

export { router as downloadRoutes }
