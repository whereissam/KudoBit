import { useState } from 'react'
import { useAccount, useSignMessage, useReadContract } from 'wagmi'
import { useNavigate } from '@tanstack/react-router'
import { signInWithEthereum } from '@/lib/auth'
import { CONTRACTS, CREATOR_REGISTRY_ABI } from '@/lib/contracts'

type AuthStep = 'connect' | 'auth' | 'complete' | 'not-found' | 'already-exists'

export function useAuthFlow(mode: 'signin' | 'signup', onSuccess: () => void, onClose: () => void) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<AuthStep>('connect')

  // Check on-chain creator registration
  const { data: isRegistered } = useReadContract({
    address: CONTRACTS.creatorRegistry,
    abi: CREATOR_REGISTRY_ABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const handleWalletAuth = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        if (isRegistered) {
          // SIWE auth for registered creators
          const authResult = await signInWithEthereum(address, async (message: string) => {
            return await signMessageAsync({ message, account: address })
          })

          if (authResult.success) {
            setStep('complete')
            setTimeout(() => {
              onSuccess()
              onClose()
            }, 1500)
          } else {
            setError(authResult.error || 'Sign in failed')
          }
        } else {
          setStep('not-found')
        }
      } else {
        // Sign up flow
        if (isRegistered) {
          setStep('already-exists')
          return
        }

        const authResult = await signInWithEthereum(address, async (message: string) => {
          return await signMessageAsync({ message, account: address })
        })

        if (authResult.success) {
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

    const authResult = await signInWithEthereum(address, async (message: string) => {
      return await signMessageAsync({ message, account: address })
    })

    if (authResult.success) {
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
