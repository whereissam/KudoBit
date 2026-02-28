import { Hono } from 'hono'
import { ReviewController } from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/auth.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

// Public routes
router.get('/products/:id/reviews', ReviewController.getByProduct)

// Protected routes
router.post('/products/:id/reviews', requireAuth, ReviewController.create)
router.put('/reviews/:id', requireAuth, ReviewController.update)
router.delete('/reviews/:id', requireAuth, ReviewController.delete)
router.post('/reviews/:id/helpful', requireAuth, ReviewController.markHelpful)

export { router as reviewRoutes }
