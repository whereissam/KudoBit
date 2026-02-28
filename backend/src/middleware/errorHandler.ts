import type { AppContext } from '../types/index.js'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export async function errorHandler(err: Error & { statusCode?: number; isOperational?: boolean }, c: AppContext): Promise<Response> {
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'

  console.error('Error:', err)

  return c.json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  }, statusCode as 500)
}

export function asyncHandler(fn: (c: AppContext, next?: unknown) => Promise<Response | void>) {
  return async (c: AppContext, next: unknown) => {
    try {
      return await fn(c, next)
    } catch (error) {
      return errorHandler(error as Error & { statusCode?: number; isOperational?: boolean }, c)
    }
  }
}
