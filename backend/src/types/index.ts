import type { Context, Next } from 'hono'

// Hono app environment - carries typed variables through middleware chain
export type AppEnv = {
  Variables: {
    user: { address: string }
    validatedBody: Record<string, unknown>
  }
}

export type AppContext = Context<AppEnv>
export type AppNext = Next

// Database row types

export interface Creator {
  address: string
  display_name: string | null
  bio: string | null
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Session {
  address: string
  token: string
  expires_at: string
  created_at: string
}

export interface Product {
  id: number
  creator_address: string
  name: string
  description: string | null
  price_usdc: string
  ipfs_hash: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: number
  buyer_address: string
  product_id: number
  price_usdc: string
  tx_hash: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
}

export interface ProductAnalyticsRow {
  id: number
  product_id: number
  view_count: number
  download_count: number
  last_viewed_at: string | null
  last_downloaded_at: string | null
  created_at: string
  updated_at: string
}

export interface Download {
  id: number
  purchase_id: number
  buyer_address: string
  product_id: number
  download_url: string
  expires_at: string
  downloaded_at: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Review {
  id: number
  product_id: number
  buyer_address: string
  purchase_id: number | null
  rating: number
  title: string | null
  comment: string | null
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface WishlistItem {
  id: number
  user_address: string
  product_id: number
  created_at: string
}

export interface Follow {
  id: number
  follower_address: string
  creator_address: string
  created_at: string
}

export interface CreatorAnalyticsRow {
  creator_address: string
  total_sales: number
  total_revenue_usdc: string
  total_products: number
  total_followers: number
  avg_rating: string | null
  total_reviews: number
  last_sale_at: string | null
  created_at: string
  updated_at: string
}

// Pagination helper
export interface PaginationParams {
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}
