// Centralized error reporting and monitoring

export interface ErrorReport {
  id: string
  timestamp: Date
  error: Error
  context?: {
    userId?: string
    route?: string
    component?: string
    action?: string
    contractAddress?: string
    transactionHash?: string
    userAgent?: string
    url?: string
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'ui' | 'contract' | 'api' | 'validation' | 'network' | 'unknown'
}

class ErrorReporter {
  private reports: ErrorReport[] = []
  private maxReports = 100

  generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  categorizeError(error: Error): ErrorReport['category'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('revert') || message.includes('gas') || message.includes('contract')) {
      return 'contract'
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network'
    }
    
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return 'validation'
    }
    
    if (message.includes('api') || message.includes('endpoint') || message.includes('status')) {
      return 'api'
    }
    
    if (message.includes('render') || message.includes('component') || message.includes('hook')) {
      return 'ui'
    }
    
    return 'unknown'
  }

  determineSeverity(error: Error, category: ErrorReport['category']): ErrorReport['severity'] {
    const message = error.message.toLowerCase()
    
    // Critical errors
    if (message.includes('critical') || message.includes('fatal') || message.includes('crash')) {
      return 'critical'
    }
    
    // High severity for contract/financial errors
    if (category === 'contract' && (message.includes('funds') || message.includes('transfer'))) {
      return 'high'
    }
    
    // Medium for validation errors
    if (category === 'validation' || category === 'api') {
      return 'medium'
    }
    
    // Low for UI/network issues
    return 'low'
  }

  report(error: Error, context?: ErrorReport['context']): ErrorReport {
    const category = this.categorizeError(error)
    const severity = this.determineSeverity(error, category)
    
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error,
      context: {
        ...context,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      severity,
      category
    }

    // Store locally (in a real app, send to monitoring service)
    this.reports.unshift(report)
    
    // Keep only the most recent reports
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports)
    }

    // Log based on severity
    this.logError(report)

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(report)
    }

    return report
  }

  private logError(report: ErrorReport) {
    const { error, severity, category, context } = report
    
    switch (severity) {
      case 'critical':
        console.error(`🔴 CRITICAL [${category}]:`, error.message, context)
        break
      case 'high':
        console.error(`🟠 HIGH [${category}]:`, error.message, context)
        break
      case 'medium':
        console.warn(`🟡 MEDIUM [${category}]:`, error.message, context)
        break
      case 'low':
        console.log(`🔵 LOW [${category}]:`, error.message, context)
        break
    }
  }

  private sendToMonitoringService(report: ErrorReport) {
    // In a real application, send to services like:
    // - Sentry
    // - LogRocket
    // - Rollbar
    // - Custom monitoring endpoint
    
    console.log('Would send to monitoring service:', {
      id: report.id,
      message: report.error.message,
      severity: report.severity,
      category: report.category,
      context: report.context
    })
  }

  getReports(filters?: {
    severity?: ErrorReport['severity']
    category?: ErrorReport['category']
    since?: Date
  }): ErrorReport[] {
    let filtered = this.reports

    if (filters?.severity) {
      filtered = filtered.filter(r => r.severity === filters.severity)
    }

    if (filters?.category) {
      filtered = filtered.filter(r => r.category === filters.category)
    }

    if (filters?.since) {
      filtered = filtered.filter(r => r.timestamp >= filters.since!)
    }

    return filtered
  }

  getStats() {
    const total = this.reports.length
    const bySeverity = this.reports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byCategory = this.reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, bySeverity, byCategory }
  }

  clear() {
    this.reports = []
  }
}

// Global error reporter instance
export const errorReporter = new ErrorReporter()

// React hook for error reporting
export function useErrorReporting() {
  const reportError = (error: Error, context?: ErrorReport['context']) => {
    return errorReporter.report(error, context)
  }

  const getErrorStats = () => errorReporter.getStats()
  
  const getRecentErrors = (count = 10) => 
    errorReporter.getReports().slice(0, count)

  return {
    reportError,
    getErrorStats,
    getRecentErrors
  }
}