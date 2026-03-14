import { productModel } from '../models/productModel.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AppContext } from '../types/index.js'

export const productController = {
  async createProduct(c: AppContext) {
    const user = c.get('user')
    const body = c.get('validatedBody') as { name: string; description?: string; price_usdc: number; ipfs_hash?: string }

    const product = await productModel.create(user.address, body)

    return c.json(product, 201)
  },

  async getProduct(c: AppContext) {
    const { id } = c.req.param()

    const product = await productModel.findById(parseInt(id))
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    return c.json(product)
  },

  async getAllProducts(c: AppContext) {
    const creator = c.req.query('creator')
    const filters = creator ? { creator } : {}

    const products = await productModel.findAll(filters)
    return c.json(products)
  },

  async updateProduct(c: AppContext) {
    const user = c.get('user')
    const { id } = c.req.param()
    const body = c.get('validatedBody') as Record<string, unknown>

    const product = await productModel.findById(parseInt(id))
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (product.creator_address !== user.address) {
      throw new AppError('Unauthorized', 403)
    }

    const updated = await productModel.update(parseInt(id), body)
    return c.json(updated)
  },

  async deleteProduct(c: AppContext) {
    const user = c.get('user')
    const { id } = c.req.param()

    const product = await productModel.findById(parseInt(id))
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (product.creator_address !== user.address) {
      throw new AppError('Unauthorized', 403)
    }

    await productModel.delete(parseInt(id))
    return c.json({ message: 'Product deleted successfully' })
  }
}
