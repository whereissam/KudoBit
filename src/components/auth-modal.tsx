import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, User, Sparkles } from 'lucide-react'
import { ConnectStep } from '@/components/auth-steps/connect-step'
import { AuthStep } from '@/components/auth-steps/auth-step'
import { SuccessStep } from '@/components/auth-steps/success-step'
import { NotFoundStep, AlreadyExistsStep } from '@/components/auth-steps/error-steps'
import { useAuthFlow } from '@/hooks/use-auth-flow'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onSuccess: () => void
}

const STEP_COMPONENTS = {
  connect: ConnectStep,
  auth: AuthStep,
  complete: SuccessStep,
  'not-found': NotFoundStep,
  'already-exists': AlreadyExistsStep,
} as const

export function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const navigate = useNavigate()
  const { step, isLoading, error, isConnected, address, actions } = useAuthFlow(mode, onSuccess, onClose)

  if (!isOpen) return null

  const renderStep = () => {
    switch (step) {
      case 'connect':
        return <ConnectStep isConnected={isConnected} address={address} onContinue={actions.goToAuth} />
      case 'auth':
        return <AuthStep mode={mode} isLoading={isLoading} error={error} onAuth={actions.handleAuth} />
      case 'complete':
        return <SuccessStep mode={mode} />
      case 'not-found':
        return <NotFoundStep onCreateAccount={actions.navigateToRegister} onTryDifferentWallet={actions.goToConnect} />
      case 'already-exists':
        return <AlreadyExistsStep onSignIn={actions.handleSignInExisting} onTryDifferentWallet={actions.goToConnect} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans tracking-normal">
      <Card className="w-full max-w-md relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            {mode === 'signin' ? (
              <User className="h-6 w-6 text-primary" />
            ) : (
              <Sparkles className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-xl">
            {mode === 'signin' ? 'Welcome Back' : 'Join KudoBit'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Sign in to access your creator dashboard'
              : 'Create your creator account and start earning'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>Don't have an account? <button className="text-primary hover:underline" onClick={actions.navigateToRegister}>Sign up</button></>
            ) : (
              <>Already have an account? <button className="text-primary hover:underline" onClick={actions.goToConnect}>Sign in</button></>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}