import { Hono } from 'hono';
import { authRoutes } from './authRoutes.js';
import { creatorRoutes } from './creatorRoutes.js';
import { productRoutes } from './productRoutes.js';
import { indexerRoutes } from './indexerRoutes.js';
import { analyticsRoutes } from './analyticsRoutes.js';
import { authenticateToken } from '../../middleware/auth.js';

const v1Routes = new Hono();

// Mount routes with proper authentication
v1Routes.route('/auth', authRoutes);

// Public routes (no authentication required)
v1Routes.route('/analytics', analyticsRoutes);

// Apply authentication middleware to protected routes
v1Routes.use('/creators/*', authenticateToken);
v1Routes.use('/products/*', authenticateToken);
v1Routes.use('/indexer/*', authenticateToken);

v1Routes.route('/creators', creatorRoutes);
v1Routes.route('/products', productRoutes);
v1Routes.route('/indexer', indexerRoutes);

export { v1Routes };