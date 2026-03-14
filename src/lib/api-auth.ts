// Enterprise API Authentication and Rate Limiting
// Secure API access control with JWT, API keys, and rate limiting

import { z } from 'zod'
import crypto from 'crypto'
import * as jwt from 'jsonwebtoken'

// Types
export interface ApiKey {
  id: string
  name: string
  key: string
  secret: string
  organizationId: string
  permissions: Permission[]
  rateLimit: RateLimit
  isActive: boolean
  expiresAt?: string
  createdAt: string
  lastUsed?: string
  usageCount: number
}

export interface Permission {
  resource: string
  actions: string[]
  constraints?: Record<string, any>
}

export interface RateLimit {
  requests: number
  windowMs: number
  burst?: number
}

export interface Organization {
  id: string
  name: string
  tier: 'starter' | 'professional' | 'enterprise'
  limits: OrganizationLimits
  isActive: boolean
  createdAt: string
}

export interface OrganizationLimits {
  apiCallsPerMonth: number
  webhooksPerOrg: number
  usersPerOrg: number
  storageGB: number
  customDomains: number
}

export interface AuthContext {
  organizationId: string
  apiKeyId: string
  permissions: Permission[]
  rateLimit: RateLimit
  user?: {
    id: string
    email: string
    role: string
  }
}

// Rate Limiting
interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map()

  check(identifier: string, limit: RateLimit): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const now = Date.now()
    const windowStart = now - limit.windowMs
    
    // Clean old entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.resetTime < now) {
        this.cache.delete(key)
      }
    }

    const entry = this.cache.get(identifier)
    
    if (!entry || entry.resetTime < now) {
      // New window
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + limit.windowMs,
        lastRequest: now
      }
      this.cache.set(identifier, newEntry)
      
      return {
        allowed: true,
        remaining: limit.requests - 1,
        resetTime: newEntry.resetTime
      }
    }

    // Check if within limits
    if (entry.count >= limit.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: entry.resetTime - now
      }
    }

    // Allow request
    entry.count++
    entry.lastRequest = now
    
    return {
      allowed: true,
      remaining: limit.requests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

// Authentication Manager
export class ApiAuthManager {
  private apiKeys: Map<string, ApiKey> = new Map()
  private organizations: Map<string, Organization> = new Map()
  private rateLimiter = new RateLimiter()
  private jwtSecret: string

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret
    this.initializeDefaultOrganizations()
  }

  // API Key Management
  async createApiKey(data: {
    name: string
    organizationId: string
    permissions: Permission[]
    rateLimit?: RateLimit
    expiresAt?: string
  }): Promise<{ apiKey: ApiKey, secret: string }> {
    const organization = this.organizations.get(data.organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    const keyId = `ak_${crypto.randomBytes(16).toString('hex')}`
    const secret = crypto.randomBytes(32).toString('hex')
    
    const apiKey: ApiKey = {
      id: keyId,
      name: data.name,
      key: keyId,
      secret: crypto.createHash('sha256').update(secret).digest('hex'),
      organizationId: data.organizationId,
      permissions: data.permissions,
      rateLimit: data.rateLimit || this.getDefaultRateLimit(organization.tier),
      isActive: true,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
      usageCount: 0
    }

    this.apiKeys.set(keyId, apiKey)
    return { apiKey, secret }
  }

  async revokeApiKey(keyId: string): Promise<void> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      throw new Error('API key not found')
    }

    apiKey.isActive = false
  }

  async validateApiKey(keyId: string, secret: string): Promise<AuthContext | null> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || !apiKey.isActive) {
      return null
    }

    // Check expiration
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null
    }

    // Verify secret
    const hashedSecret = crypto.createHash('sha256').update(secret).digest('hex')
    if (hashedSecret !== apiKey.secret) {
      return null
    }

    // Update usage
    apiKey.lastUsed = new Date().toISOString()
    apiKey.usageCount++

    return {
      organizationId: apiKey.organizationId,
      apiKeyId: apiKey.id,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit
    }
  }

  // JWT Authentication
  async createJWT(payload: {
    organizationId: string
    userId: string
    email: string
    role: string
    permissions: Permission[]
  }, expiresIn: string = '1h'): Promise<string> {
    try {
      const token = jwt.sign(payload, this.jwtSecret, { expiresIn } as jwt.SignOptions)
      return token as string
    } catch (error) {
      throw error
    }
  }

  async validateJWT(token: string): Promise<AuthContext | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any
      
      return {
        organizationId: decoded.organizationId,
        apiKeyId: 'jwt',
        permissions: decoded.permissions,
        rateLimit: this.getDefaultRateLimit('professional'), // Default for JWT
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      }
    } catch {
      return null
    }
  }

  // Rate Limiting
  checkRateLimit(authContext: AuthContext, identifier?: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const limitIdentifier = identifier || authContext.organizationId
    return this.rateLimiter.check(limitIdentifier, authContext.rateLimit)
  }

  // Permission Checking
  hasPermission(
    authContext: AuthContext,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean {
    return authContext.permissions.some(permission => {
      if (permission.resource !== resource && permission.resource !== '*') {
        return false
      }

      if (!permission.actions.includes(action) && !permission.actions.includes('*')) {
        return false
      }

      // Check constraints if provided
      if (permission.constraints && context) {
        for (const [key, value] of Object.entries(permission.constraints)) {
          if (context[key] !== value) {
            return false
          }
        }
      }

      return true
    })
  }

  // Organization Management
  async createOrganization(data: {
    name: string
    tier: 'starter' | 'professional' | 'enterprise'
  }): Promise<Organization> {
    const organization: Organization = {
      id: `org_${crypto.randomBytes(16).toString('hex')}`,
      name: data.name,
      tier: data.tier,
      limits: this.getOrganizationLimits(data.tier),
      isActive: true,
      createdAt: new Date().toISOString()
    }

    this.organizations.set(organization.id, organization)
    return organization
  }

  async getOrganization(id: string): Promise<Organization | null> {
    return this.organizations.get(id) || null
  }

  // Helper Methods
  private getDefaultRateLimit(tier: string): RateLimit {
    switch (tier) {
      case 'starter':
        return { requests: 100, windowMs: 60000 } // 100 req/min
      case 'professional':
        return { requests: 1000, windowMs: 60000 } // 1000 req/min
      case 'enterprise':
        return { requests: 10000, windowMs: 60000 } // 10000 req/min
      default:
        return { requests: 100, windowMs: 60000 }
    }
  }

  private getOrganizationLimits(tier: string): OrganizationLimits {
    switch (tier) {
      case 'starter':
        return {
          apiCallsPerMonth: 10000,
          webhooksPerOrg: 5,
          usersPerOrg: 10,
          storageGB: 1,
          customDomains: 0
        }
      case 'professional':
        return {
          apiCallsPerMonth: 100000,
          webhooksPerOrg: 25,
          usersPerOrg: 50,
          storageGB: 10,
          customDomains: 3
        }
      case 'enterprise':
        return {
          apiCallsPerMonth: 1000000,
          webhooksPerOrg: 100,
          usersPerOrg: 500,
          storageGB: 100,
          customDomains: 10
        }
      default:
        return {
          apiCallsPerMonth: 10000,
          webhooksPerOrg: 5,
          usersPerOrg: 10,
          storageGB: 1,
          customDomains: 0
        }
    }
  }

  private initializeDefaultOrganizations(): void {
    // Create default organizations for testing
    const defaultOrg: Organization = {
      id: 'org_default',
      name: 'Default Organization',
      tier: 'professional',
      limits: this.getOrganizationLimits('professional'),
      isActive: true,
      createdAt: new Date().toISOString()
    }

    this.organizations.set(defaultOrg.id, defaultOrg)
  }

  // Analytics and Monitoring
  async getUsageStats(organizationId: string): Promise<{
    apiCallsThisMonth: number
    activeApiKeys: number
    totalWebhooks: number
    rateLimitHits: number
  }> {
    const orgApiKeys = Array.from(this.apiKeys.values())
      .filter(key => key.organizationId === organizationId)

    return {
      apiCallsThisMonth: orgApiKeys.reduce((sum, key) => sum + key.usageCount, 0),
      activeApiKeys: orgApiKeys.filter(key => key.isActive).length,
      totalWebhooks: 0, // Would integrate with webhook system
      rateLimitHits: 0 // Would track from rate limiter
    }
  }
}

// Middleware Functions
export function createAuthMiddleware(authManager: ApiAuthManager) {
  return async (request: Request): Promise<{
    success: boolean
    authContext?: AuthContext
    error?: string
    rateLimitHeaders?: Record<string, string>
  }> => {
    try {
      const authorization = request.headers.get('Authorization')
      let authContext: AuthContext | null = null

      if (authorization?.startsWith('Bearer ')) {
        // JWT Authentication
        const token = authorization.substring(7)
        authContext = await authManager.validateJWT(token)
      } else if (authorization?.startsWith('ApiKey ')) {
        // API Key Authentication
        const [keyId, secret] = authorization.substring(7).split(':')
        if (keyId && secret) {
          authContext = await authManager.validateApiKey(keyId, secret)
        }
      }

      if (!authContext) {
        return { success: false, error: 'Invalid authentication' }
      }

      // Check rate limit
      const rateLimit = authManager.checkRateLimit(authContext)
      const rateLimitHeaders = {
        'X-RateLimit-Limit': authContext.rateLimit.requests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
      }

      if (!rateLimit.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          rateLimitHeaders: {
            ...rateLimitHeaders,
            'Retry-After': Math.ceil((rateLimit.retryAfter || 0) / 1000).toString()
          }
        }
      }

      return {
        success: true,
        authContext,
        rateLimitHeaders
      }
    } catch (error) {
      return {
        success: false,
        error: 'Authentication error'
      }
    }
  }
}

// Export singleton
export const apiAuthManager = new ApiAuthManager(
  process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('JWT_SECRET must be set in production') })()
    : 'dev-secret-DO-NOT-USE-IN-PROD')
)

// Predefined Permissions
export const PERMISSIONS = {
  CREATORS: {
    READ: { resource: 'creators', actions: ['read'] },
    WRITE: { resource: 'creators', actions: ['create', 'update'] },
    DELETE: { resource: 'creators', actions: ['delete'] },
    ALL: { resource: 'creators', actions: ['*'] }
  },
  PERKS: {
    READ: { resource: 'perks', actions: ['read'] },
    WRITE: { resource: 'perks', actions: ['create', 'update'] },
    DELETE: { resource: 'perks', actions: ['delete'] },
    ALL: { resource: 'perks', actions: ['*'] }
  },
  PURCHASES: {
    READ: { resource: 'purchases', actions: ['read'] },
    WRITE: { resource: 'purchases', actions: ['create', 'update'] },
    ALL: { resource: 'purchases', actions: ['*'] }
  },
  ANALYTICS: {
    READ: { resource: 'analytics', actions: ['read'] },
    ALL: { resource: 'analytics', actions: ['*'] }
  },
  ADMIN: {
    ALL: { resource: '*', actions: ['*'] }
  }
} as const