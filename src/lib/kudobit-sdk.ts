// KudoBit JavaScript SDK
// Developer-friendly wrapper for the KudoBit API

import { ApiClient, ApiConfig, ApiResponse } from './api-client'
import { z } from 'zod'

// SDK Configuration
export interface SDKConfig extends Partial<ApiConfig> {
  apiKey: string
  environment?: 'sandbox' | 'production'
  debug?: boolean
}

// SDK Types
export interface Creator {
  id: string
  name: string
  email: string
  walletAddress: string
  isVerified: boolean
  tier: 'basic' | 'premium' | 'enterprise'
  createdAt: string
  updatedAt: string
}

export interface Perk {
  id: string
  creatorId: string
  name: string
  description: string
  type: 'digital' | 'physical' | 'experience'
  price: number
  currency: string
  isActive: boolean
  totalSupply?: number
  remainingSupply?: number
  metadata: Record<string, any>
  createdAt: string
}

export interface Purchase {
  id: string
  perkId: string
  buyerId: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  transactionHash?: string
  createdAt: string
}

export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, any>
  timestamp: string
}

// Main SDK Class
export class KudoBitSDK {
  private client: ApiClient
  private config: SDKConfig

  constructor(config: SDKConfig) {
    this.config = {
      environment: 'production',
      debug: false,
      baseUrl: config.environment === 'sandbox' 
        ? 'https://api-sandbox.kudobit.com/v1'
        : 'https://api.kudobit.com/v1',
      version: 'v1',
      timeout: 30000,
      retries: 3,
      ...config
    }

    this.client = new ApiClient(this.config as ApiConfig)
  }

  // Creator Methods
  async getCreator(creatorId: string): Promise<Creator> {
    const response = await this.client.get(`/creators/${creatorId}`)
    return response.data as Creator
  }

  async createCreator(data: {
    name: string
    email: string
    walletAddress: string
  }): Promise<Creator> {
    const response = await this.client.post('/creators', data)
    return response.data as Creator
  }

  async updateCreator(creatorId: string, updates: Partial<Creator>): Promise<Creator> {
    const response = await this.client.put(`/creators/${creatorId}`, updates)
    return response.data as Creator
  }

  async listCreators(params?: {
    page?: number
    limit?: number
    tier?: string
    verified?: boolean
  }): Promise<{ creators: Creator[], pagination: any }> {
    const response = await this.client.get('/creators', { params })
    return response.data
  }

  // Perk Methods
  async getPerk(perkId: string): Promise<Perk> {
    const response = await this.client.get(`/perks/${perkId}`)
    return response.data as Perk
  }

  async createPerk(creatorId: string, data: {
    name: string
    description: string
    type: 'digital' | 'physical' | 'experience'
    price: number
    currency: string
    totalSupply?: number
    metadata?: Record<string, any>
  }): Promise<Perk> {
    const response = await this.client.post('/perks', { ...data, creatorId })
    return response.data as Perk
  }

  async updatePerk(perkId: string, updates: Partial<Perk>): Promise<Perk> {
    const response = await this.client.put(`/perks/${perkId}`, updates)
    return response.data as Perk
  }

  async listPerks(params?: {
    creatorId?: string
    type?: string
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<{ perks: Perk[], pagination: any }> {
    const response = await this.client.get('/perks', { params })
    return response.data
  }

  async deletePerk(perkId: string): Promise<void> {
    await this.client.delete(`/perks/${perkId}`)
  }

  // Purchase Methods
  async createPurchase(data: {
    perkId: string
    buyerId: string
    paymentMethod: 'crypto' | 'fiat'
  }): Promise<Purchase> {
    const response = await this.client.post('/purchases', data)
    return response.data as Purchase
  }

  async getPurchase(purchaseId: string): Promise<Purchase> {
    const response = await this.client.get(`/purchases/${purchaseId}`)
    return response.data as Purchase
  }

  async listPurchases(params?: {
    buyerId?: string
    creatorId?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ purchases: Purchase[], pagination: any }> {
    const response = await this.client.get('/purchases', { params })
    return response.data
  }

  async confirmPurchase(purchaseId: string, transactionHash: string): Promise<Purchase> {
    const response = await this.client.post(`/purchases/${purchaseId}/confirm`, {
      transactionHash
    })
    return response.data as Purchase
  }

  // Analytics Methods
  async getCreatorAnalytics(creatorId: string, params?: {
    startDate?: string
    endDate?: string
    metrics?: string[]
  }): Promise<Record<string, any>> {
    const response = await this.client.get(`/creators/${creatorId}/analytics`, { params })
    return response.data
  }

  async getPlatformAnalytics(params?: {
    startDate?: string
    endDate?: string
    metrics?: string[]
  }): Promise<Record<string, any>> {
    const response = await this.client.get('/analytics', { params })
    return response.data
  }

  // Webhook Methods
  async createWebhook(data: {
    url: string
    events: string[]
    secret?: string
  }): Promise<{ id: string, url: string, events: string[], secret: string }> {
    const response = await this.client.post('/webhooks', data)
    return response.data
  }

  async listWebhooks(): Promise<any[]> {
    const response = await this.client.get('/webhooks')
    return response.data
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.client.delete(`/webhooks/${webhookId}`)
  }

  async verifyWebhook(payload: string, signature: string, secret: string): Promise<boolean> {
    const crypto = await import('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return signature === `sha256=${expectedSignature}`
  }

  // Utility Methods
  async getHealth(): Promise<{ status: string, version: string, timestamp: string }> {
    const response = await this.client.get('/health')
    return response.data
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.getHealth()
      return true
    } catch {
      return false
    }
  }

  // Batch Operations
  async batchCreatePerks(creatorId: string, perks: Array<{
    name: string
    description: string
    type: 'digital' | 'physical' | 'experience'
    price: number
    currency: string
    totalSupply?: number
    metadata?: Record<string, any>
  }>): Promise<Perk[]> {
    const response = await this.client.post('/perks/batch', {
      creatorId,
      perks
    })
    return response.data
  }

  async batchUpdatePerks(updates: Array<{
    id: string
    updates: Partial<Perk>
  }>): Promise<Perk[]> {
    const response = await this.client.put('/perks/batch', { updates })
    return response.data
  }

  // Real-time Features
  async subscribeToEvents(events: string[], callback: (event: WebhookEvent) => void): Promise<() => void> {
    if (typeof window === 'undefined') {
      throw new Error('Real-time subscriptions are only available in browser environments')
    }

    const eventSource = new EventSource(`${this.config.baseUrl}/events/stream?events=${events.join(',')}&apiKey=${this.config.apiKey}`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(data)
      } catch (error) {
        console.error('Failed to parse event data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
    }

    return () => {
      eventSource.close()
    }
  }
}

// Helper Functions
export function createSDK(config: SDKConfig): KudoBitSDK {
  return new KudoBitSDK(config)
}

export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const sdk = new KudoBitSDK({ apiKey: 'temp' })
  return await sdk.verifyWebhook(payload, signature, secret)
}

// Export types for TypeScript users
export type {
  SDKConfig as SDKConfiguration,
  Creator as CreatorType,
  Perk as PerkType,
  Purchase as PurchaseType,
  WebhookEvent as WebhookEventType
}

// Default export
export default KudoBitSDK