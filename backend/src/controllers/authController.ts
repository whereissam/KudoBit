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

export const authController = {
  async getNonce(c: AppContext) {
    return c.json({ nonce: generateNonce() })
  },

  async verify(c: AppContext) {
    const { message, signature } = await c.req.json()

    if (!message || !signature) {
      throw new AppError('Missing message or signature', 400)
    }

    try {
      const siweMessage = new SiweMessage(message)
      const verification = await siweMessage.verify({ signature })

      if (!verification.success) {
        throw new AppError('Invalid signature', 401)
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
      console.error('Auth error:', error)
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
