import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletConnect } from '@/components/wallet-connect'
import { CreatorService } from '@/lib/creator-service'
import { signInWithEthereum } from '@/lib/auth'
import { X, User, Sparkles } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onSuccess: () => void
}

export function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'connect' | 'auth' | 'complete' | 'not-found' | 'already-exists'>('connect')

  if (!isOpen) return null

  const handleWalletAuth = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        // Sign in existing user
        const result = await CreatorService.signInCreator(address)
        
        if (result.success && result.profile) {
          CreatorService.saveCreatorSession(result.profile)
          setStep('complete')
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 1500)
        } else if (result.needsRegistration) {
          setStep('not-found')
        } else {
          setError(result.error || 'Sign in failed')
        }
      } else {
        // Check if user already exists
        const existingStatus = await CreatorService.getCreatorStatus(address)
        if (existingStatus.canAccessCreatorFeatures) {
          setStep('already-exists')
          return
        }

        // Sign up new user - redirect to full registration
        const authResult = await signInWithEthereum(address, async (message: string) => {
          return await signMessageAsync({ message, account: address })
        })
        
        if (authResult.success) {
          localStorage.setItem('kudobit_temp_token', authResult.token || '')
          localStorage.setItem('kudobit_temp_address', address)
          onClose()
          // Navigate to full registration form
          navigate({ to: '/register' })
        } else {
          setError(authResult.error || 'Authentication failed')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
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
          {step === 'connect' && (
            <>
              {!isConnected ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to continue
                  </p>
                  <WalletConnect />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setStep('auth')}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </>
          )}

          {step === 'auth' && (
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

              <Button 
                onClick={handleWalletAuth}
                disabled={isLoading}
                className="w-full"
              >
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
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-background rounded-full" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Success!</h4>
                <p className="text-sm text-green-800">
                  {mode === 'signin' ? 'Welcome back!' : 'Account created successfully!'}
                </p>
              </div>
            </div>
          )}

          {step === 'not-found' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <h4 className="font-medium text-orange-900">No Account Found</h4>
                <p className="text-sm text-orange-800 mb-4">
                  This wallet doesn't have a creator account yet.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    onClose()
                    navigate({ to: '/register' })
                  }}
                  className="w-full"
                >
                  Create Account
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setStep('connect')}
                  className="w-full"
                >
                  Try Different Wallet
                </Button>
              </div>
            </div>
          )}

          {step === 'already-exists' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Account Exists</h4>
                <p className="text-sm text-blue-800 mb-4">
                  This wallet already has a creator account.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={async () => {
                    setStep('auth')
                    // Auto sign in the existing user
                    const result = await CreatorService.signInCreator(address!)
                    if (result.success && result.profile) {
                      CreatorService.saveCreatorSession(result.profile)
                      setStep('complete')
                      setTimeout(() => {
                        onSuccess()
                        onClose()
                      }, 1500)
                    }
                  }}
                  className="w-full"
                >
                  Sign In Instead
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setStep('connect')}
                  className="w-full"
                >
                  Try Different Wallet
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>Don't have an account? <button className="text-primary hover:underline" onClick={() => { onClose(); navigate({ to: '/register' }); }}>Sign up</button></>
            ) : (
              <>Already have an account? <button className="text-primary hover:underline" onClick={() => setStep('connect')}>Sign in</button></>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}