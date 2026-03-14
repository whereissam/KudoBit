import { SiweMessage } from 'siwe'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config/env.js'
import { creatorModel } from '../models/creatorModel.js'
import { sessionModel } from '../models/sessionModel.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AppContext } from '../types/index.js'

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

// In-memory nonce store with TTL (5 minutes)
const nonceStore = new Map<string, number>()
const NONCE_TTL_MS = 5 * 60 * 1000

function storeNonce(nonce: string): void {
  // Clean expired nonces
  const now = Date.now()
  for (const [key, expiry] of nonceStore.entries()) {
    if (expiry < now) nonceStore.delete(key)
  }
  nonceStore.set(nonce, now + NONCE_TTL_MS)
}

function consumeNonce(nonce: string): boolean {
  const expiry = nonceStore.get(nonce)
  if (!expiry || expiry < Date.now()) return false
  nonceStore.delete(nonce)
  return true
}

export const authController = {
  async getNonce(c: AppContext) {
    const nonce = generateNonce()
    storeNonce(nonce)
    return c.json({ nonce })
  },

  async verify(c: AppContext) {
    const { message, signature } = await c.req.json()

    if (!message || !signature) {
      throw new AppError('Missing message or signature', 400)
    }

    try {
      const siweMessage = new SiweMessage(message)

      // Verify signature, domain, and nonce
      const verification = await siweMessage.verify({
        signature,
        domain: config.siwe.domain,
        nonce: siweMessage.nonce,
      })

      if (!verification.success) {
        throw new AppError('Invalid signature', 401)
      }

      // Validate nonce was issued by us and consume it (single-use)
      if (!consumeNonce(siweMessage.nonce)) {
        throw new AppError('Invalid or expired nonce', 401)
      }

      const address = siweMessage.address.toLowerCase()
      const token = jwt.sign({ address }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      })
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await sessionModel.create(address, token, expiresAt)
      await creatorModel.create(address)

      return c.json({
        token,
        address,
        expiresAt: expiresAt.toISOString()
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Auth verification failed')
      throw new AppError('Authentication failed', 500)
    }
  },

  async logout(c: AppContext) {
    const user = c.get('user')
    if (user?.address) {
      await sessionModel.delete(user.address)
    }
    return c.json({ message: 'Logged out successfully' })
  },

  async me(c: AppContext) {
    const user = c.get('user')
    if (!user?.address) {
      throw new AppError('Not authenticated', 401)
    }

    const creator = await creatorModel.findByAddress(user.address)
    return c.json({
      address: user.address,
      ...creator
    })
  }
}
