import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface ErrorContext {
  action?: string
  component?: string
  userId?: string
  contractAddress?: string
  transactionHash?: string
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: ErrorContext) => {
    console.error('Error occurred:', error, context)
    
    let message = 'An unexpected error occurred'
    let title = 'Error'
    let isUserError = false

    if (error instanceof Error) {
      // Web3/Contract specific errors
      if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
        title = 'Transaction Cancelled'
        message = 'You cancelled the transaction'
        isUserError = true
      } else if (error.message.includes('insufficient funds') || error.message.includes('insufficient balance')) {
        title = 'Insufficient Funds'
        message = 'You don\'t have enough funds for this transaction'
        isUserError = true
      } else if (error.message.includes('gas')) {
        title = 'Gas Error'
        message = 'Transaction failed due to gas issues. Try increasing gas limit.'
        isUserError = true
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        title = 'Network Error'
        message = 'Unable to connect to the blockchain. Check your connection.'
      } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
        title = 'Not Found'
        message = 'The requested item was not found'
        isUserError = true
      } else if (error.message.includes('unauthorized') || error.message.includes('access denied')) {
        title = 'Access Denied'
        message = 'You don\'t have permission to perform this action'
        isUserError = true
      } else if (error.message.includes('expired')) {
        title = 'Session Expired'
        message = 'Your session has expired. Please reconnect your wallet.'
        isUserError = true
      } else {
        // Use the actual error message for other cases
        message = error.message
      }
    }

    // Show toast notification
    toast.error(message, {
      duration: isUserError ? 3000 : 5000,
      style: {
        maxWidth: '400px',
      },
    })

    // In development, log additional context
    if (process.env.NODE_ENV === 'development' && context) {
      console.group(`🚨 ${title}`)
      console.log('Message:', message)
      console.log('Context:', context)
      console.log('Error:', error)
      console.groupEnd()
    }

    return {
      title,
      message,
      isUserError,
      originalError: error
    }
  }, [])

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    customErrorMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      const errorInfo = handleError(error, context)
      if (customErrorMessage) {
        toast.error(customErrorMessage)
      }
      return null
    }
  }, [handleError])

  const handleContractError = useCallback((error: unknown, contractName?: string, functionName?: string) => {
    return handleError(error, {
      action: `Contract interaction: ${contractName}.${functionName}`,
      component: 'Contract',
      contractAddress: contractName
    })
  }, [handleError])

  const handleApiError = useCallback((error: unknown, endpoint?: string, method = 'GET') => {
    return handleError(error, {
      action: `API call: ${method} ${endpoint}`,
      component: 'API'
    })
  }, [handleError])

  return {
    handleError,
    handleAsyncError,
    handleContractError,
    handleApiError
  }
}

// Error logging utility
export function logError(error: unknown, context?: ErrorContext) {
  // In a real app, you'd send this to an error tracking service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    console.error('Production error:', error, context)
  } else {
    console.error('Development error:', error, context)
  }
}

// Common error types
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

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}