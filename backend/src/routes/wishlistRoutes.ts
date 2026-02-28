import { Hono } from 'hono'
import { WishlistController } from '../controllers/wishlistController.js'
import { requireAuth } from '../middleware/auth.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

// All wishlist routes require auth
router.use('/*', requireAuth)

router.get('/', WishlistController.get)
router.post('/:productId', WishlistController.add)
router.delete('/:productId', WishlistController.remove)
router.get('/:productId/check', WishlistController.check)

export { router as wishlistRoutes }
