import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useNavigate } from '@tanstack/react-router'
import { CreatorService } from '@/lib/creator-service'
import { signInWithEthereum } from '@/lib/auth'

type AuthStep = 'connect' | 'auth' | 'complete' | 'not-found' | 'already-exists'

export function useAuthFlow(mode: 'signin' | 'signup', onSuccess: () => void, onClose: () => void) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<AuthStep>('connect')

  const handleWalletAuth = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
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
        const existingStatus = await CreatorService.getCreatorStatus(address)
        if (existingStatus.canAccessCreatorFeatures) {
          setStep('already-exists')
          return
        }

        const authResult = await signInWithEthereum(address, async (message: string) => {
          return await signMessageAsync({ message, account: address })
        })
        
        if (authResult.success) {
          localStorage.setItem('kudobit_temp_token', authResult.token || '')
          localStorage.setItem('kudobit_temp_address', address)
          onClose()
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

  const handleSignInExisting = async () => {
    if (!address) return
    
    const result = await CreatorService.signInCreator(address)
    if (result.success && result.profile) {
      CreatorService.saveCreatorSession(result.profile)
      setStep('complete')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    }
  }

  const actions = {
    goToAuth: () => setStep('auth'),
    goToConnect: () => setStep('connect'),
    handleAuth: handleWalletAuth,
    handleSignInExisting,
    navigateToRegister: () => {
      onClose()
      navigate({ to: '/register' })
    }
  }

  return {
    step,
    isLoading,
    error,
    isConnected,
    address,
    actions
  }
}