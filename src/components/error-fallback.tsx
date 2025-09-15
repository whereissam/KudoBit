import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  title?: string
  description?: string
  showHomeButton?: boolean
}

export function ErrorFallback({ 
  error, 
  resetError, 
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  showHomeButton = true
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Error Details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {error.message}
                {error.stack && `\n\nStack trace:\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={resetError}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            {showHomeButton && (
              <Button 
                asChild
                variant="outline" 
                className="flex-1"
              >
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Specific error fallbacks for different contexts
export function ContractErrorFallback({ error, resetError }: { error: Error, resetError: () => void }) {
  const isUserRejection = error.message.includes('User rejected') || error.message.includes('user rejected')
  const isInsufficientFunds = error.message.includes('insufficient') || error.message.includes('balance')
  const isNetworkError = error.message.includes('network') || error.message.includes('connection')

  let title = "Transaction Failed"
  let description = "There was an issue with your blockchain transaction."

  if (isUserRejection) {
    title = "Transaction Cancelled"
    description = "You cancelled the transaction in your wallet."
  } else if (isInsufficientFunds) {
    title = "Insufficient Funds"
    description = "You don't have enough funds to complete this transaction."
  } else if (isNetworkError) {
    title = "Network Error"
    description = "Unable to connect to the blockchain. Please check your connection."
  }

  return (
    <ErrorFallback
      error={error}
      resetError={resetError}
      title={title}
      description={description}
      showHomeButton={false}
    />
  )
}

export function ProductErrorFallback({ error, resetError }: { error: Error, resetError: () => void }) {
  return (
    <ErrorFallback
      error={error}
      resetError={resetError}
      title="Product Not Found"
      description="The product you're looking for doesn't exist or has been removed."
    />
  )
}