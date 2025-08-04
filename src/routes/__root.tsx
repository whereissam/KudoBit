import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AppleLayout } from '@/components/apple-layout'
import { AuthModal } from '@/components/auth-modal'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { CONTRACTS, getContracts, CREATOR_STORE_ABI, LOYALTY_TOKEN_ABI } from '@/lib/contracts'
import { CreatorService } from '@/lib/creator-service'
import { useMemo, lazy, Suspense, useState, useEffect } from 'react'

// Lazy load devtools only in development
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/router-devtools').then(res => ({ default: res.TanStackRouterDevtools })))
  : () => null

function RootComponent() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({ 
    isOpen: false, 
    mode: 'signin' 
  })
  const [isCreator, setIsCreator] = useState(false)
  
  // Get contracts for current chain
  const currentContracts = useMemo(() => getContracts(chainId), [chainId])
  
  // Only fetch owner data if user is connected to reduce unnecessary calls
  const { data: creatorStoreOwner } = useReadContract({
    address: currentContracts.creatorStore,
    abi: CREATOR_STORE_ABI,
    functionName: 'owner',
    query: {
      enabled: !!isConnected && !!address,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  })
  
  const { data: loyaltyTokenOwner } = useReadContract({
    address: currentContracts.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI, 
    functionName: 'owner',
    query: {
      enabled: !!isConnected && !!address,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  })
  
  // Check creator status - FIXED to prevent infinite loops
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  
  // Memoize expensive computations - MOVED BEFORE useEffect
  const hasAdminAccess = useMemo(() => {
    if (!address || !isConnected) return false
    
    const isCreatorStoreOwner = creatorStoreOwner && address.toLowerCase() === (creatorStoreOwner as string).toLowerCase()
    const isLoyaltyTokenOwner = loyaltyTokenOwner && address.toLowerCase() === (loyaltyTokenOwner as string).toLowerCase()
    
    return isCreatorStoreOwner || isLoyaltyTokenOwner
  }, [address, isConnected, creatorStoreOwner, loyaltyTokenOwner])
  
  useEffect(() => {
    if (!isConnected || !address) {
      setCreatorProfile(null);
      return;
    }
    
    const profile = CreatorService.getCurrentCreatorProfile();
    // Only update if profile actually changed (deep comparison)
    setCreatorProfile(prevProfile => {
      if (!profile && !prevProfile) return prevProfile; // Keep null reference
      if (!profile && prevProfile) return null;
      if (profile && !prevProfile) return profile;
      if (profile && prevProfile && profile.address === prevProfile.address) {
        return prevProfile; // Keep same reference if address matches
      }
      return profile;
    });
  }, [isConnected, address]);

  useEffect(() => {
    if (!address || !isConnected) {
      setIsCreator(false);
      return;
    }

    const checkCreatorStatus = async () => {
      // Check 1: Contract ownership (wallet-based)
      const isContractOwner = hasAdminAccess;
      
      // Check 2: Backend registration (profile-based) 
      let hasBackendProfile = false;
      try {
        const status = await CreatorService.getCreatorStatus(address);
        hasBackendProfile = status.canAccessCreatorFeatures;
        
        // Auto-register contract owners in backend if not already registered
        if (isContractOwner && !hasBackendProfile) {
          console.log('🔄 Auto-registering contract owner in backend...');
          
          // Create a basic profile for contract owner
          const autoProfile = {
            address: address.toLowerCase(),
            displayName: `Contract Owner ${address.slice(0, 6)}...${address.slice(-4)}`,
            bio: 'Contract owner with admin access',
            socialLinks: {},
            isVerified: true,
            isOnChainCreator: true,
            createdAt: new Date().toISOString()
          };
          
          // Save to localStorage first (immediate fallback)
          CreatorService.saveCreatorSession(autoProfile);
          
          // Try to register in backend (if available)
          try {
            // Create a dummy token for auto-registration
            const dummyToken = btoa(JSON.stringify({ address, isOwner: true, timestamp: Date.now() }));
            await CreatorService.registerCreator(address, {
              displayName: autoProfile.displayName,
              bio: autoProfile.bio,
              socialLinks: autoProfile.socialLinks
            }, dummyToken);
            console.log('✅ Auto-registration successful');
          } catch (regError) {
            console.log('⚠️ Backend auto-registration failed, using localStorage');
          }
          
          hasBackendProfile = true;
        }
      } catch (error) {
        console.log('Backend check failed, using local profile');
        hasBackendProfile = !!(creatorProfile && creatorProfile.address === address.toLowerCase());
      }
      
      // User is creator if they own contracts OR have a backend/local profile
      setIsCreator(isContractOwner || hasBackendProfile);
    };

    checkCreatorStatus();
  }, [address, isConnected, hasAdminAccess]);

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'signin' })
  }
  
  return (
    <>
      <AppleLayout onAuthModal={openAuthModal}>
        <Outlet />
      </AppleLayout>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onSuccess={() => {
          setIsCreator(true)
          closeAuthModal()
        }}
      />
      
      {/* Dev Tools */}
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})