import { Button } from '@/components/ui/button'

interface AuthStepProps {
  mode: 'signin' | 'signup'
  isLoading: boolean
  error: string
  onAuth: () => void
}

export function AuthStep({ mode, isLoading, error, onAuth }: AuthStepProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary/5 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h4>
        <p className="text-sm text-blue-800">
          {mode === 'signin' 
            ? 'Verify your wallet ownership to access your account'
            : 'Sign a message to create your secure account'
          }
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button onClick={onAuth} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
          </>
        ) : (
          mode === 'signin' ? 'Sign In with Wallet' : 'Create Account'
        )}
      </Button>
    </div>
  )
}