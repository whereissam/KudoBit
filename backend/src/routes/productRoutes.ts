import { Hono } from 'hono'
import { productController } from '../controllers/productController.js'
import { requireAuth } from '../middleware/auth.js'
import { validateProductCreate, validateProductUpdate } from '../middleware/validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import type { AppEnv } from '../types/index.js'

const productRoutes = new Hono<AppEnv>()

productRoutes.get('/', asyncHandler(productController.getAllProducts))
productRoutes.post('/', requireAuth, validateProductCreate, asyncHandler(productController.createProduct))
productRoutes.get('/:id', asyncHandler(productController.getProduct))
productRoutes.put('/:id', requireAuth, validateProductUpdate, asyncHandler(productController.updateProduct))
productRoutes.delete('/:id', requireAuth, asyncHandler(productController.deleteProduct))

export { productRoutes }
