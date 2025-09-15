import { useState, useEffect, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private cache = new Map<string, CacheEntry<any>>()
  
  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  size(): number {
    return this.cache.size
  }
}

// Global cache instance
const globalCache = new Cache()

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: {
    ttl?: number
    enabled?: boolean
    revalidateOnFocus?: boolean
    revalidateOnReconnect?: boolean
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    revalidateOnFocus = false,
    revalidateOnReconnect = false
  } = options

  const [data, setData] = useState<T | null>(() => 
    enabled ? globalCache.get<T>(key) : null
  )
  const [isLoading, setIsLoading] = useState<boolean>(!data && enabled)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    // Return cached data if available and not forced
    if (!force && globalCache.has(key)) {
      const cachedData = globalCache.get<T>(key)
      if (cachedData) {
        setData(cachedData)
        setIsLoading(false)
        return cachedData
      }
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await fetcher()
      
      globalCache.set(key, result, ttl)
      setData(result)
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, ttl, enabled])

  // Initial fetch
  useEffect(() => {
    if (enabled && !data) {
      fetchData()
    }
  }, [enabled, data, fetchData])

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      if (enabled && data) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [revalidateOnFocus, enabled, data, fetchData])

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      if (enabled && data) {
        fetchData()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [revalidateOnReconnect, enabled, data, fetchData])

  const mutate = useCallback((newData: T) => {
    globalCache.set(key, newData, ttl)
    setData(newData)
  }, [key, ttl])

  const invalidate = useCallback(() => {
    globalCache.delete(key)
    setData(null)
  }, [key])

  const revalidate = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    mutate,
    invalidate,
    revalidate,
    isStale: !globalCache.has(key)
  }
}

// Hook for cached contract reads
export function useCachedContractRead<T>(
  key: string,
  contractCall: () => Promise<T> | T,
  options?: {
    ttl?: number
    enabled?: boolean
  }
) {
  return useCache(key, contractCall, {
    ttl: 30 * 1000, // 30 seconds for contract data
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    ...options
  })
}

// Utility functions
export const cacheUtils = {
  clear: () => globalCache.clear(),
  delete: (key: string) => globalCache.delete(key),
  size: () => globalCache.size(),
  
  // Preload data
  preload: <T>(key: string, data: T, ttl?: number) => {
    globalCache.set(key, data, ttl)
  },
  
  // Batch invalidate
  invalidatePrefix: (prefix: string) => {
    const keysToDelete: string[] = []
    // Note: Map doesn't have a way to iterate keys directly in this simple implementation
    // In a production app, you'd want a more sophisticated cache with prefix support
    globalCache.clear() // For now, clear all
  }
}

// Cache key builders
export const cacheKeys = {
  product: (id: number) => `product:${id}`,
  productList: (filters?: Record<string, any>) => 
    `products:${filters ? JSON.stringify(filters) : 'all'}`,
  userWishlist: (address: string) => `wishlist:${address}`,
  userPurchases: (address: string) => `purchases:${address}`,
  creatorProfile: (address: string) => `creator:${address}`,
  creatorProducts: (address: string) => `creator:${address}:products`,
}