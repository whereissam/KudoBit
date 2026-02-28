import { Hono } from 'hono'
import { authController } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import type { AppEnv } from '../types/index.js'

const authRoutes = new Hono<AppEnv>()

authRoutes.get('/nonce', asyncHandler(authController.getNonce))
authRoutes.post('/verify', asyncHandler(authController.verify))
authRoutes.post('/logout', requireAuth, asyncHandler(authController.logout))
authRoutes.get('/me', requireAuth, asyncHandler(authController.me))

export { authRoutes }
