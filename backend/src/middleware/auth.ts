import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import type { AppContext, AppNext } from '../types/index.js'

export async function requireAuth(c: AppContext, next: AppNext): Promise<Response | void> {
  // Development bypass for testing
  if (config.nodeEnv === 'development') {
    const testAddress = c.req.header('X-Test-Address')
    if (testAddress) {
      c.set('user', { address: testAddress.toLowerCase() })
      await next()
      return
    }
  }

  const authHeader = c.req.header('Authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { address: string }
    c.set('user', decoded)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

export async function optionalAuth(c: AppContext, next: AppNext): Promise<void> {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.split(' ')[1]

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { address: string }
      c.set('user', decoded)
    } catch {
      // Token invalid, but continue without auth
    }
  }

  await next()
}
