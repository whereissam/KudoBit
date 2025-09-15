// KudoBit Webhook System
// Enterprise-grade webhook management and event processing

import { z } from 'zod'
import crypto from 'crypto'

// Webhook Types
export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  retryPolicy: RetryPolicy
  rateLimit: RateLimit
  createdAt: string
  updatedAt: string
  lastDelivery?: string
  failureCount: number
}

export interface RetryPolicy {
  maxRetries: number
  backoffMultiplier: number
  initialDelay: number
  maxDelay: number
}

export interface RateLimit {
  requests: number
  windowMs: number
}

export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, any>
  timestamp: string
  version: string
}

export interface DeliveryAttempt {
  id: string
  webhookId: string
  eventId: string
  url: string
  status: 'pending' | 'success' | 'failed' | 'retrying'
  httpStatus?: number
  responseBody?: string
  error?: string
  attempt: number
  deliveredAt?: string
  nextRetryAt?: string
}

// Event Types
export enum WebhookEventType {
  CREATOR_CREATED = 'creator.created',
  CREATOR_UPDATED = 'creator.updated',
  CREATOR_VERIFIED = 'creator.verified',
  PERK_CREATED = 'perk.created',
  PERK_UPDATED = 'perk.updated',
  PERK_DELETED = 'perk.deleted',
  PURCHASE_CREATED = 'purchase.created',
  PURCHASE_CONFIRMED = 'purchase.confirmed',
  PURCHASE_DELIVERED = 'purchase.delivered',
  PURCHASE_CANCELLED = 'purchase.cancelled',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_FAILED = 'payment.failed',
  TIER_UPGRADED = 'tier.upgraded',
  ANALYTICS_MILESTONE = 'analytics.milestone'
}

// Validation Schemas
const webhookEndpointSchema = z.object({
  url: z.string().url(),
  events: z.array(z.nativeEnum(WebhookEventType)),
  secret: z.string().optional(),
  retryPolicy: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    backoffMultiplier: z.number().min(1).max(5).default(2),
    initialDelay: z.number().min(1000).max(60000).default(1000),
    maxDelay: z.number().min(60000).max(3600000).default(300000)
  }).optional(),
  rateLimit: z.object({
    requests: z.number().min(1).max(1000).default(100),
    windowMs: z.number().min(60000).max(3600000).default(300000)
  }).optional()
})

// Webhook Manager Class
export class WebhookManager {
  private endpoints: Map<string, WebhookEndpoint> = new Map()
  private deliveryQueue: DeliveryAttempt[] = []
  private rateLimitCache: Map<string, { count: number, resetTime: number }> = new Map()
  private isProcessing = false

  constructor() {
    this.startDeliveryProcessor()
  }

  // Endpoint Management
  async createWebhook(data: z.infer<typeof webhookEndpointSchema>): Promise<WebhookEndpoint> {
    const validated = webhookEndpointSchema.parse(data)
    
    const webhook: WebhookEndpoint = {
      id: crypto.randomUUID(),
      url: validated.url,
      events: validated.events,
      secret: validated.secret || this.generateSecret(),
      isActive: true,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 300000,
        ...validated.retryPolicy
      },
      rateLimit: {
        requests: 100,
        windowMs: 300000,
        ...validated.rateLimit
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      failureCount: 0
    }

    this.endpoints.set(webhook.id, webhook)
    return webhook
  }

  async updateWebhook(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const webhook = this.endpoints.get(id)
    if (!webhook) {
      throw new Error(`Webhook ${id} not found`)
    }

    const updated = {
      ...webhook,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.endpoints.set(id, updated)
    return updated
  }

  async deleteWebhook(id: string): Promise<void> {
    if (!this.endpoints.has(id)) {
      throw new Error(`Webhook ${id} not found`)
    }
    this.endpoints.delete(id)
  }

  async getWebhook(id: string): Promise<WebhookEndpoint | null> {
    return this.endpoints.get(id) || null
  }

  async listWebhooks(): Promise<WebhookEndpoint[]> {
    return Array.from(this.endpoints.values())
  }

  // Event Processing
  async dispatchEvent(event: WebhookEvent): Promise<void> {
    const relevantWebhooks = Array.from(this.endpoints.values())
      .filter(webhook => 
        webhook.isActive && 
        webhook.events.includes(event.type)
      )

    for (const webhook of relevantWebhooks) {
      if (this.checkRateLimit(webhook.id, webhook.rateLimit)) {
        const attempt: DeliveryAttempt = {
          id: crypto.randomUUID(),
          webhookId: webhook.id,
          eventId: event.id,
          url: webhook.url,
          status: 'pending',
          attempt: 1
        }

        this.deliveryQueue.push(attempt)
      }
    }
  }

  // Delivery System
  private async startDeliveryProcessor(): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.isProcessing) {
      try {
        const pendingAttempts = this.deliveryQueue.filter(
          attempt => attempt.status === 'pending' || 
          (attempt.status === 'retrying' && 
           attempt.nextRetryAt && 
           new Date(attempt.nextRetryAt) <= new Date())
        )

        for (const attempt of pendingAttempts) {
          await this.deliverWebhook(attempt)
        }

        // Clean up old completed attempts
        this.deliveryQueue = this.deliveryQueue.filter(
          attempt => attempt.status === 'pending' || attempt.status === 'retrying'
        )

        // Wait before next cycle
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Webhook delivery processor error:', error)
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  }

  private async deliverWebhook(attempt: DeliveryAttempt): Promise<void> {
    const webhook = this.endpoints.get(attempt.webhookId)
    if (!webhook) {
      attempt.status = 'failed'
      attempt.error = 'Webhook endpoint not found'
      return
    }

    try {
      const payload = await this.buildPayload(attempt.eventId)
      const signature = this.signPayload(payload, webhook.secret)

      const response = await fetch(attempt.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KudoBit-Signature': signature,
          'X-KudoBit-Event-Type': payload.type,
          'X-KudoBit-Delivery': attempt.id,
          'User-Agent': 'KudoBit-Webhooks/1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
      })

      attempt.httpStatus = response.status
      attempt.responseBody = await response.text().catch(() => '')

      if (response.ok) {
        attempt.status = 'success'
        attempt.deliveredAt = new Date().toISOString()
        webhook.lastDelivery = attempt.deliveredAt
        webhook.failureCount = 0
      } else {
        await this.handleDeliveryFailure(attempt, webhook, `HTTP ${response.status}`)
      }
    } catch (error) {
      await this.handleDeliveryFailure(attempt, webhook, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async handleDeliveryFailure(
    attempt: DeliveryAttempt, 
    webhook: WebhookEndpoint, 
    error: string
  ): Promise<void> {
    attempt.error = error
    webhook.failureCount++

    if (attempt.attempt < webhook.retryPolicy.maxRetries) {
      attempt.status = 'retrying'
      attempt.attempt++
      
      const delay = Math.min(
        webhook.retryPolicy.initialDelay * Math.pow(webhook.retryPolicy.backoffMultiplier, attempt.attempt - 1),
        webhook.retryPolicy.maxDelay
      )
      
      attempt.nextRetryAt = new Date(Date.now() + delay).toISOString()
    } else {
      attempt.status = 'failed'
      
      // Disable webhook after too many failures
      if (webhook.failureCount >= 50) {
        webhook.isActive = false
      }
    }
  }

  private async buildPayload(eventId: string): Promise<WebhookEvent> {
    // In a real implementation, this would fetch the event from a database
    // For now, we'll create a mock event
    return {
      id: eventId,
      type: WebhookEventType.PURCHASE_CREATED,
      data: {
        purchase: {
          id: 'purchase_123',
          perkId: 'perk_456',
          buyerId: 'user_789',
          amount: 100,
          currency: 'USD'
        }
      },
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  }

  private signPayload(payload: WebhookEvent, secret: string): string {
    const payloadString = JSON.stringify(payload)
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex')
    return `sha256=${signature}`
  }

  private checkRateLimit(webhookId: string, rateLimit: RateLimit): boolean {
    const now = Date.now()
    const cached = this.rateLimitCache.get(webhookId)

    if (!cached || now > cached.resetTime) {
      this.rateLimitCache.set(webhookId, {
        count: 1,
        resetTime: now + rateLimit.windowMs
      })
      return true
    }

    if (cached.count >= rateLimit.requests) {
      return false
    }

    cached.count++
    return true
  }

  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Verification Utilities
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    const providedSignature = signature.replace('sha256=', '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )
  }

  // Monitoring and Analytics
  async getDeliveryStats(webhookId?: string): Promise<{
    totalAttempts: number
    successfulDeliveries: number
    failedDeliveries: number
    averageResponseTime: number
    successRate: number
  }> {
    const attempts = webhookId 
      ? this.deliveryQueue.filter(a => a.webhookId === webhookId)
      : this.deliveryQueue

    const totalAttempts = attempts.length
    const successfulDeliveries = attempts.filter(a => a.status === 'success').length
    const failedDeliveries = attempts.filter(a => a.status === 'failed').length
    
    return {
      totalAttempts,
      successfulDeliveries,
      failedDeliveries,
      averageResponseTime: 0, // Would calculate from actual delivery times
      successRate: totalAttempts > 0 ? (successfulDeliveries / totalAttempts) * 100 : 0
    }
  }

  // Cleanup
  stop(): void {
    this.isProcessing = false
  }
}

// Export singleton instance
export const webhookManager = new WebhookManager()

// Helper functions
export function createWebhookEvent(
  type: WebhookEventType,
  data: Record<string, any>
): WebhookEvent {
  return {
    id: crypto.randomUUID(),
    type,
    data,
    timestamp: new Date().toISOString(),
    version: '1.0'
  }
}

export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  return WebhookManager.verifySignature(payload, signature, secret)
}