import { Hono } from 'hono'
import { FollowController } from '../controllers/followController.js'
import { requireAuth } from '../middleware/auth.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

// Creator-specific routes (public)
router.get('/creators/:address/followers', FollowController.getFollowers)
// Note: /creators/:address/stats is handled by creatorRoutes to avoid conflict

// Protected routes
router.post('/creators/:address/follow', requireAuth, FollowController.follow)
router.delete('/creators/:address/follow', requireAuth, FollowController.unfollow)
router.get('/creators/:address/follow/check', requireAuth, FollowController.checkFollowing)
router.get('/following', requireAuth, FollowController.getFollowing)

export { router as followRoutes }
