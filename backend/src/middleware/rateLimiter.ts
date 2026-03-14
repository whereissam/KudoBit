import type { AppContext, AppNext } from '../types/index.js'

interface RateLimitConfig {
  requests: number
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Periodic cleanup every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) store.delete(key)
  }
}, 60_000)

export function rateLimiter(config: RateLimitConfig) {
  return async (c: AppContext, next: AppNext): Promise<Response | void> => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown'

    const key = `${ip}:${c.req.path}`
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetTime < now) {
      store.set(key, { count: 1, resetTime: now + config.windowMs })
      c.header('X-RateLimit-Limit', config.requests.toString())
      c.header('X-RateLimit-Remaining', (config.requests - 1).toString())
      await next()
      return
    }

    if (entry.count >= config.requests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      c.header('Retry-After', retryAfter.toString())
      return c.json({ error: 'Too many requests' }, 429)
    }

    entry.count++
    c.header('X-RateLimit-Limit', config.requests.toString())
    c.header('X-RateLimit-Remaining', (config.requests - entry.count).toString())
    await next()
  }
}
