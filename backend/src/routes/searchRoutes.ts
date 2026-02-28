import { Hono } from 'hono'
import { SearchController } from '../controllers/searchController.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

router.post('/', SearchController.search)
router.get('/trending', SearchController.getTrending)
router.get('/featured', SearchController.getFeatured)

export { router as searchRoutes }
