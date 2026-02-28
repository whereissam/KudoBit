import { creatorModel } from '../models/creatorModel.js'
import { productModel } from '../models/productModel.js'
import { purchaseModel } from '../models/purchaseModel.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AppContext } from '../types/index.js'

export const creatorController = {
  async getCreator(c: AppContext) {
    const { address } = c.req.param()

    const creator = await creatorModel.findByAddress(address)
    if (!creator) {
      throw new AppError('Creator not found', 404)
    }

    return c.json(creator)
  },

  async updateProfile(c: AppContext) {
    const user = c.get('user')
    const body = c.get('validatedBody')

    const updated = await creatorModel.update(user.address, body as { display_name?: string; bio?: string; social_links?: Record<string, string> })
    if (!updated) {
      throw new AppError('Failed to update profile', 500)
    }

    return c.json(updated)
  },

  async getCreatorProducts(c: AppContext) {
    const { address } = c.req.param()

    const products = await productModel.findByCreator(address)
    return c.json(products)
  },

  async getCreatorStats(c: AppContext) {
    const { address } = c.req.param()

    const creator = await creatorModel.findByAddress(address)
    if (!creator) {
      throw new AppError('Creator not found', 404)
    }

    const products = await productModel.findByCreator(address)

    const purchases = await purchaseModel.findByProduct(
      products.map(p => p.id)
    )

    const totalSales = purchases.reduce((sum, p) => sum + parseFloat(p.price_usdc), 0)
    const totalPurchases = purchases.length

    return c.json({
      creator,
      stats: {
        totalProducts: products.length,
        totalSales,
        totalPurchases,
        products
      }
    })
  },

  async getAllCreators(c: AppContext) {
    const creators = await creatorModel.findAll()
    return c.json(creators)
  }
}
