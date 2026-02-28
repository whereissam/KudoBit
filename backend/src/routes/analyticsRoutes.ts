import { Hono } from 'hono'
import { AnalyticsController } from '../controllers/analyticsController.js'
import { SearchController } from '../controllers/searchController.js'
import { requireAuth } from '../middleware/auth.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

// Product analytics (public)
router.get('/products/:id/analytics', AnalyticsController.getProductAnalytics)
router.post('/products/:id/view', SearchController.trackView)

// Creator analytics (protected - own data only)
router.get('/creators/:address/analytics', requireAuth, AnalyticsController.getCreatorAnalytics)
router.get('/creators/:address/sales', requireAuth, AnalyticsController.getCreatorSales)
router.get('/creators/:address/revenue', requireAuth, AnalyticsController.getRevenueOverTime)
router.get('/creators/:address/top-products', requireAuth, AnalyticsController.getTopProducts)

export { router as analyticsRoutes }
