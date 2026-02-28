import { Hono } from 'hono'
import { creatorController } from '../controllers/creatorController.js'
import { requireAuth } from '../middleware/auth.js'
import { validateProfileUpdate } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import type { AppEnv } from '../types/index.js'

const creatorRoutes = new Hono<AppEnv>()

creatorRoutes.get('/', asyncHandler(creatorController.getAllCreators))
creatorRoutes.get('/:address', asyncHandler(creatorController.getCreator))
creatorRoutes.get('/:address/products', asyncHandler(creatorController.getCreatorProducts))
creatorRoutes.get('/:address/stats', asyncHandler(creatorController.getCreatorStats))
creatorRoutes.put('/profile', requireAuth, validateProfileUpdate, asyncHandler(creatorController.updateProfile))

export { creatorRoutes }
