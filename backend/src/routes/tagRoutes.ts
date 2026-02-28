import { Hono } from 'hono'
import { TagController } from '../controllers/tagController.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

router.get('/', TagController.getAll)
router.get('/popular', TagController.getPopular)
router.get('/:slug/products', TagController.getProducts)

export { router as tagRoutes }
