import { AppError } from './errorHandler.js'
import type { AppContext, AppNext } from '../types/index.js'

export const validateProductCreate = async (c: AppContext, next: AppNext): Promise<void> => {
  const body = await c.req.json()

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new AppError('Product name is required', 400)
  }

  if (!body.price_usdc || isNaN(parseFloat(body.price_usdc)) || parseFloat(body.price_usdc) <= 0) {
    throw new AppError('Valid price is required', 400)
  }

  c.set('validatedBody', body)
  await next()
}

export const validatePurchaseCreate = async (c: AppContext, next: AppNext): Promise<void> => {
  const body = await c.req.json()

  if (!body.product_id || !Number.isInteger(Number(body.product_id))) {
    throw new AppError('Valid product ID is required', 400)
  }

  if (!body.price_usdc || isNaN(parseFloat(body.price_usdc))) {
    throw new AppError('Valid price is required', 400)
  }

  if (!body.tx_hash || !/^0x[a-fA-F0-9]{64}$/.test(body.tx_hash)) {
    throw new AppError('Valid transaction hash is required', 400)
  }

  c.set('validatedBody', body)
  await next()
}

export const validateProfileUpdate = async (c: AppContext, next: AppNext): Promise<void> => {
  const body = await c.req.json()

  if (body.display_name && typeof body.display_name !== 'string') {
    throw new AppError('Display name must be a string', 400)
  }

  if (body.bio && typeof body.bio !== 'string') {
    throw new AppError('Bio must be a string', 400)
  }

  if (body.social_links && typeof body.social_links !== 'object') {
    throw new AppError('Social links must be an object', 400)
  }

  c.set('validatedBody', body)
  await next()
}
