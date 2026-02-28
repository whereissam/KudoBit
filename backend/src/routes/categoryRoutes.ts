import { Hono } from 'hono'
import { CategoryController } from '../controllers/categoryController.js'
import type { AppEnv } from '../types/index.js'

const router = new Hono<AppEnv>()

router.get('/', CategoryController.getAll)
router.get('/:slug', CategoryController.getBySlug)
router.get('/:slug/products', CategoryController.getProducts)

export { router as categoryRoutes }
