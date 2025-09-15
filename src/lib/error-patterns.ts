// Standardized error handling patterns for the application

export const ErrorPatterns = {
  // Async operation with error handling
  withErrorHandling: <T>(operation: () => Promise<T>, context?: string) => {
    return async (): Promise<T | null> => {
      try {
        return await operation()
      } catch (error) {
        console.error(`Error in ${context || 'operation'}:`, error)
        throw error
      }
    }
  },

  // Safe operation that never throws
  safely: <T>(operation: () => T, fallback: T): T => {
    try {
      return operation()
    } catch (error) {
      console.error('Safe operation failed:', error)
      return fallback
    }
  },

  // Async safe operation
  safelyAsync: async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await operation()
    } catch (error) {
      console.error('Safe async operation failed:', error)
      return fallback
    }
  },

  // Validation with error context
  validate: (condition: boolean, message: string, field?: string) => {
    if (!condition) {
      throw new ValidationError(message, field)
    }
  },

  // Type guards for common error types
  isContractError: (error: unknown): error is Error => {
    return error instanceof Error && (
      error.message.includes('revert') ||
      error.message.includes('gas') ||
      error.message.includes('insufficient')
    )
  },

  isNetworkError: (error: unknown): error is Error => {
    return error instanceof Error && (
      error.message.includes('network') ||
      error.message.includes('connection') ||
      error.message.includes('timeout')
    )
  },

  isUserRejectionError: (error: unknown): error is Error => {
    return error instanceof Error && (
      error.message.includes('User rejected') ||
      error.message.includes('user rejected') ||
      error.message.includes('denied')
    )
  }
}

// Standard error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ContractError extends Error {
  constructor(message: string, public contractName?: string, public functionName?: string) {
    super(message)
    this.name = 'ContractError'
  }
}

export class ApiError extends Error {
  constructor(message: string, public status?: number, public endpoint?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Error boundary hook
export function useStandardErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    if (ErrorPatterns.isUserRejectionError(error)) {
      // Don't show error for user rejections
      return
    }

    if (ErrorPatterns.isNetworkError(error)) {
      console.error('Network error:', error)
      // Handle network errors differently
      return
    }

    if (ErrorPatterns.isContractError(error)) {
      console.error('Contract error:', error)
      // Handle contract errors
      return
    }

    // Default error handling
    console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  }

  return { handleError }
}