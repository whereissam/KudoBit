import { Hono } from 'hono'
import { authRoutes } from './authRoutes.js'
import { creatorRoutes } from './creatorRoutes.js'
import { productRoutes } from './productRoutes.js'
import { purchaseRoutes } from './purchaseRoutes.js'
import { categoryRoutes } from './categoryRoutes.js'
import { tagRoutes } from './tagRoutes.js'
import { searchRoutes } from './searchRoutes.js'
import { reviewRoutes } from './reviewRoutes.js'
import { wishlistRoutes } from './wishlistRoutes.js'
import { followRoutes } from './followRoutes.js'
import { analyticsRoutes } from './analyticsRoutes.js'
import { downloadRoutes } from './downloadRoutes.js'
import { ipfsRoutes } from './ipfsRoutes.js'
import type { AppEnv } from '../types/index.js'

const apiRoutes = new Hono<AppEnv>()

// Core routes
apiRoutes.route('/auth', authRoutes)
apiRoutes.route('/creators', creatorRoutes)
apiRoutes.route('/products', productRoutes)
apiRoutes.route('/purchases', purchaseRoutes)

// Phase 1: Search & Discovery
apiRoutes.route('/categories', categoryRoutes)
apiRoutes.route('/tags', tagRoutes)
apiRoutes.route('/search', searchRoutes)

// Phase 1: Analytics & Downloads
apiRoutes.route('/', analyticsRoutes)
apiRoutes.route('/', downloadRoutes)

// IPFS proxy (Pinata keys stay server-side)
apiRoutes.route('/ipfs', ipfsRoutes)

// Phase 2: Social Features
apiRoutes.route('/', reviewRoutes)
apiRoutes.route('/wishlist', wishlistRoutes)
apiRoutes.route('/', followRoutes)

export { apiRoutes }
