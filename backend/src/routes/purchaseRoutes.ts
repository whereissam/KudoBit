import { Hono } from 'hono'
import { purchaseController } from '../controllers/purchaseController.js'
import { requireAuth } from '../middleware/auth.js'
import { validatePurchaseCreate } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import type { AppEnv } from '../types/index.js'

const purchaseRoutes = new Hono<AppEnv>()

purchaseRoutes.post('/', requireAuth, validatePurchaseCreate, asyncHandler(purchaseController.createPurchase))
purchaseRoutes.get('/buyer/:address', requireAuth, asyncHandler(purchaseController.getUserPurchases))
purchaseRoutes.get('/content/:product_id', requireAuth, asyncHandler(purchaseController.getContentAccess))
purchaseRoutes.get('/verify/:address/:product_id', asyncHandler(purchaseController.verifyPurchase))

export { purchaseRoutes }
