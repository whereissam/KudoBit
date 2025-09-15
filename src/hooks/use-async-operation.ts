import { useState, useCallback } from 'react'

export function useAsyncOperation<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (operation: () => Promise<T>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await operation()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

export function useLoadingState(initialState = false) {
  const [loading, setLoading] = useState(initialState)

  const withLoading = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    setLoading(true)
    try {
      return await operation()
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, setLoading, withLoading }
}