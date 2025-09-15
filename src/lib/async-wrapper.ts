import { useErrorHandler } from '@/hooks/use-error-handler'
import { useCallback } from 'react'

// Standard wrapper for async operations with consistent error handling
export function useAsyncWrapper() {
  const { handleError, handleContractError, handleApiError } = useErrorHandler()

  const wrapAsync = useCallback(<T>(
    operation: () => Promise<T>,
    options?: {
      context?: string
      fallback?: T
      suppressError?: boolean
    }
  ) => {
    return async (): Promise<T | null> => {
      try {
        return await operation()
      } catch (error) {
        if (!options?.suppressError) {
          handleError(error, { action: options?.context })
        }
        return options?.fallback ?? null
      }
    }
  }, [handleError])

  const wrapContractCall = useCallback(<T>(
    operation: () => Promise<T>,
    contractName?: string,
    functionName?: string
  ) => {
    return async (): Promise<T | null> => {
      try {
        return await operation()
      } catch (error) {
        handleContractError(error, contractName, functionName)
        return null
      }
    }
  }, [handleContractError])

  const wrapApiCall = useCallback(<T>(
    operation: () => Promise<T>,
    endpoint?: string,
    method = 'GET'
  ) => {
    return async (): Promise<T | null> => {
      try {
        return await operation()
      } catch (error) {
        handleApiError(error, endpoint, method)
        return null
      }
    }
  }, [handleApiError])

  return {
    wrapAsync,
    wrapContractCall,
    wrapApiCall
  }
}

// Utility function for handling promise results with error boundaries
export async function safePromise<T>(
  promise: Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await promise
  } catch (error) {
    console.error('Promise failed safely:', error)
    return fallback
  }
}

// Utility for handling multiple promises with individual error handling
export async function safePromiseAll<T>(
  promises: Promise<T>[],
  fallbacks: T[]
): Promise<T[]> {
  const results = await Promise.allSettled(promises)
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      console.error(`Promise ${index} failed:`, result.reason)
      return fallbacks[index]
    }
  })
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Don't retry user rejections
      if (lastError.message.includes('user rejected') || lastError.message.includes('User rejected')) {
        throw lastError
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}