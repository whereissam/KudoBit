// Enterprise API Client for KudoBit Platform
import { z } from 'zod'

// API Configuration
export interface ApiConfig {
  baseUrl: string
  apiKey: string
  version: string
  timeout: number
  retries: number
}

// Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  requestId: z.string()
})

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  }),
  timestamp: z.string(),
  requestId: z.string()
})

// API Client Class
export class KudoBitApiClient {
  private config: ApiConfig
  private requestId: string

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.kudobit.com/v1',
      apiKey: config.apiKey || '',
      version: config.version || 'v1',
      timeout: config.timeout || 30000,
      retries: config.retries || 3
    }
    this.requestId = this.generateRequestId()
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Request-ID': this.requestId,
      'X-API-Version': this.config.version,
      ...options.headers
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          await response.text()
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof ApiError) throw error
      throw new ApiError('Network request failed', 0, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Product Management API
  async getProducts(filters?: {
    category?: string
    creator?: string
    priceMin?: number
    priceMax?: number
    page?: number
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString())
      })
    }
    
    return this.makeRequest(`/products?${params.toString()}`)
  }

  async getProduct(productId: string) {
    return this.makeRequest(`/products/${productId}`)
  }

  async createProduct(product: {
    name: string
    description: string
    price: number
    category: string
    contentHash: string
    loyaltyBadgeId?: number
  }) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    })
  }

  // Creator Management API
  async getCreators(filters?: {
    verified?: boolean
    specialty?: string
    page?: number
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString())
      })
    }
    
    return this.makeRequest(`/creators?${params.toString()}`)
  }

  async getCreator(address: string) {
    return this.makeRequest(`/creators/${address}`)
  }

  async updateCreator(address: string, updates: Partial<{
    displayName: string
    bio: string
    website: string
    twitter: string
    discord: string
    specialties: string[]
  }>) {
    return this.makeRequest(`/creators/${address}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  // Analytics API
  async getAnalytics(type: 'platform' | 'creator' | 'product', id?: string) {
    const endpoint = id ? `/analytics/${type}/${id}` : `/analytics/${type}`
    return this.makeRequest(endpoint)
  }

  async getRevenueMetrics(timeframe: 'day' | 'week' | 'month' | 'year', chainId?: number) {
    const params = new URLSearchParams({ timeframe })
    if (chainId) params.append('chainId', chainId.toString())
    
    return this.makeRequest(`/analytics/revenue?${params.toString()}`)
  }

  // Transaction API
  async getTransactions(filters?: {
    address?: string
    productId?: string
    chainId?: number
    status?: 'pending' | 'confirmed' | 'failed'
    page?: number
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString())
      })
    }
    
    return this.makeRequest(`/transactions?${params.toString()}`)
  }

  async getTransaction(txHash: string) {
    return this.makeRequest(`/transactions/${txHash}`)
  }

  // Loyalty API
  async getLoyaltyBadges(address: string) {
    return this.makeRequest(`/loyalty/${address}/badges`)
  }

  async awardBadge(address: string, badgeId: number, reason?: string) {
    return this.makeRequest(`/loyalty/${address}/award`, {
      method: 'POST',
      body: JSON.stringify({ badgeId, reason })
    })
  }

  // Webhook API
  async createWebhook(webhook: {
    url: string
    events: string[]
    secret?: string
    active?: boolean
  }) {
    return this.makeRequest('/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook)
    })
  }

  async getWebhooks() {
    return this.makeRequest('/webhooks')
  }

  async updateWebhook(webhookId: string, updates: Partial<{
    url: string
    events: string[]
    active: boolean
  }>) {
    return this.makeRequest(`/webhooks/${webhookId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteWebhook(webhookId: string) {
    return this.makeRequest(`/webhooks/${webhookId}`, {
      method: 'DELETE'
    })
  }

  // Chain Management API
  async getSupportedChains() {
    return this.makeRequest('/chains')
  }

  async getChainMetrics(chainId: number) {
    return this.makeRequest(`/chains/${chainId}/metrics`)
  }

  // Rate Limiting and Health
  async getApiStatus() {
    return this.makeRequest('/status')
  }

  async getRateLimits() {
    return this.makeRequest('/rate-limits')
  }
}

// Custom Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Webhook Event Types
export type WebhookEvent = 
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'transaction.pending'
  | 'transaction.confirmed'
  | 'transaction.failed'
  | 'creator.registered'
  | 'creator.verified'
  | 'badge.awarded'
  | 'payment.received'

// Export class and types for SDK
export class ApiClient extends KudoBitApiClient {
  async get(path: string, options?: { params?: Record<string, any> }): Promise<ApiResponse> {
    const url = options?.params 
      ? `${path}?${new URLSearchParams(options.params).toString()}`
      : path
    const response = await this.makeRequest(url, { method: 'GET' })
    return {
      data: response,
      status: 200,
      headers: {}
    }
  }

  async post(path: string, data?: any): Promise<ApiResponse> {
    const response = await this.makeRequest(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
    return {
      data: response,
      status: 200,
      headers: {}
    }
  }

  async put(path: string, data?: any): Promise<ApiResponse> {
    const response = await this.makeRequest(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
    return {
      data: response,
      status: 200,
      headers: {}
    }
  }

  async delete(path: string): Promise<ApiResponse> {
    const response = await this.makeRequest(path, { method: 'DELETE' })
    return {
      data: response,
      status: 200,
      headers: {}
    }
  }
}
export type ApiResponse<T = any> = {
  data: T
  status: number
  headers: Record<string, string>
}

// Export default configured client
export const apiClient = new KudoBitApiClient()

// Export factory function for custom configurations
export function createApiClient(config: Partial<ApiConfig>): KudoBitApiClient {
  return new KudoBitApiClient(config)
}