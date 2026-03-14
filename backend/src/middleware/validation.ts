import { AppError } from './errorHandler.js'
import type { AppContext, AppNext } from '../types/index.js'

const MAX_NAME_LENGTH = 255
const MAX_DESCRIPTION_LENGTH = 5000
const MAX_BIO_LENGTH = 1000

export const validateProductCreate = async (c: AppContext, next: AppNext): Promise<void> => {
  const body = await c.req.json()

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new AppError('Product name is required', 400)
  }

  if (body.name.length > MAX_NAME_LENGTH) {
    throw new AppError(`Product name must be ${MAX_NAME_LENGTH} characters or less`, 400)
  }

  if (body.description && typeof body.description === 'string' && body.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new AppError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`, 400)
  }

  if (!body.price_usdc || isNaN(parseFloat(body.price_usdc)) || parseFloat(body.price_usdc) <= 0) {
    throw new AppError('Valid price is required', 400)
  }

  c.set('validatedBody', body)
  await next()
}

export const validateProductUpdate = async (c: AppContext, next: AppNext): Promise<void> => {
  const body = await c.req.json()

  // Only allow known fields
  const allowedFields = ['name', 'description', 'price_usdc', 'ipfs_hash', 'is_active']
  const sanitized: Record<string, unknown> = {}

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      sanitized[key] = body[key]
    }
  }

  if (sanitized.name !== undefined) {
    if (typeof sanitized.name !== 'string' || (sanitized.name as string).trim().length === 0) {
      throw new AppError('Product name cannot be empty', 400)
    }
    if ((sanitized.name as string).length > MAX_NAME_LENGTH) {
      throw new AppError(`Product name must be ${MAX_NAME_LENGTH} characters or less`, 400)
    }
  }

  if (sanitized.description !== undefined && typeof sanitized.description === 'string' && (sanitized.description as string).length > MAX_DESCRIPTION_LENGTH) {
    throw new AppError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`, 400)
  }

  if (sanitized.price_usdc !== undefined) {
    if (isNaN(parseFloat(sanitized.price_usdc as string)) || parseFloat(sanitized.price_usdc as string) <= 0) {
      throw new AppError('Valid price is required', 400)
    }
  }

  if (sanitized.is_active !== undefined && typeof sanitized.is_active !== 'boolean') {
    throw new AppError('is_active must be a boolean', 400)
  }

  c.set('validatedBody', sanitized)
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

  if (body.display_name !== undefined) {
    if (typeof body.display_name !== 'string') {
      throw new AppError('Display name must be a string', 400)
    }
    if (body.display_name.length > MAX_NAME_LENGTH) {
      throw new AppError(`Display name must be ${MAX_NAME_LENGTH} characters or less`, 400)
    }
  }

  if (body.bio !== undefined) {
    if (typeof body.bio !== 'string') {
      throw new AppError('Bio must be a string', 400)
    }
    if (body.bio.length > MAX_BIO_LENGTH) {
      throw new AppError(`Bio must be ${MAX_BIO_LENGTH} characters or less`, 400)
    }
  }

  if (body.social_links && typeof body.social_links !== 'object') {
    throw new AppError('Social links must be an object', 400)
  }

  c.set('validatedBody', body)
  await next()
}
