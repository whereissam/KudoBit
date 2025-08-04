import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState, useEffect, useRef } from 'react'
import { CreatorService } from '@/lib/creator-service'
import { Button } from '@/components/ui/button'
import { User, LogIn, LogOut, Settings, Loader2, ChevronDown, ShoppingCart } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const [isCreator, setIsCreator] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (isConnected && address) {
      // Check local storage first for quick UI update
      const profile = CreatorService.getCurrentCreatorProfile()
      const isCurrentWalletCreator = profile && profile.address === address.toLowerCase()
      setIsCreator(!!isCurrentWalletCreator)
    } else {
      setIsCreator(false)
    }
  }, [address, isConnected])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreatorSignIn = async () => {
    if (!address || isLoading) return
    
    setIsLoading(true)
    try {
      const result = await CreatorService.signInCreator(address)
      
      if (result.success && result.profile) {
        CreatorService.saveCreatorSession(result.profile)
        setIsCreator(true)
        navigate({ to: '/creator/dashboard' })
      } else if (result.needsRegistration) {
        // No creator profile found, redirect to register
        navigate({ to: '/register' })
      } else {
        console.error('Sign in failed:', result.error)
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    CreatorService.clearCreatorSession()
    setIsCreator(false)
  }
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-2 sm:px-3 text-xs sm:text-sm font-sans tracking-normal"
                  >
                    <span className="hidden xs:inline">Connect Wallet</span>
                    <span className="xs:hidden">Connect</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs sm:text-sm sm:px-4 border-red-200 text-destructive hover:bg-red-50"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-1 sm:px-2 text-xs"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 2,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden sm:inline">{chain.name}</span>
                  </button>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      type="button"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      <span className="font-mono text-xs sm:text-sm">
                        {account.displayName}
                        <span className="hidden sm:inline">
                          {account.displayBalance ? ` (${account.displayBalance})` : ''}
                        </span>
                      </span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                    
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-lg z-50">
                        <div className="p-1">
                          <button
                            onClick={() => {
                              openAccountModal()
                              setShowDropdown(false)
                            }}
                            className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Wallet Settings
                          </button>
                          
                          <div className="my-1 h-px bg-border" />
                          
                          {isCreator ? (
                            <>
                              <button
                                onClick={() => {
                                  navigate({ to: '/creator/dashboard' })
                                  setShowDropdown(false)
                                }}
                                className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                <User className="mr-2 h-4 w-4" />
                                Dashboard
                              </button>
                              <button
                                onClick={() => {
                                  navigate({ to: '/creator/profile' })
                                  setShowDropdown(false)
                                }}
                                className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                <User className="mr-2 h-4 w-4" />
                                Profile
                              </button>
                              <button
                                onClick={() => {
                                  handleSignOut()
                                  setShowDropdown(false)
                                }}
                                className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  navigate({ to: '/purchases' })
                                  setShowDropdown(false)
                                }}
                                className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                My Purchases
                              </button>
                              <div className="my-1 h-px bg-border" />
                              <button
                                onClick={() => {
                                  handleCreatorSignIn()
                                  setShowDropdown(false)
                                }}
                                disabled={isLoading}
                                className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <LogIn className="mr-2 h-4 w-4" />
                                )}
                                Join as Creator
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}