import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ShoppingCart,
  Award,
  Zap,
  CheckCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  User,
  ExternalLink,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Star,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi'
import { CONTRACTS, getContracts, CREATOR_STORE_ABI, MOCK_USDC_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { AuthService } from '@/lib/auth'
import { AppleHero } from '@/components/apple-hero'
import { AppleProducts } from '@/components/apple-products'
import { AuthModal } from '@/components/auth-modal'

export const Route = createFileRoute('/')({
  component: KudoBitShop,
})

type TransactionState = 'idle' | 'approving' | 'purchasing' | 'success' | 'error'

interface CreatorProfile {
  address: string;
  displayName?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  isVerified?: boolean;
}

interface Product {
  id: bigint
  name: string
  description: string
  ipfsContentHash: string
  priceInUSDC: bigint
  isActive: boolean
  loyaltyBadgeId: bigint
  category: string
  views: number
  sales: number
  rating: number
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular' | 'rating'
type ViewMode = 'grid' | 'list'

function KudoBitShop() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [transactionState, setTransactionState] = useState<TransactionState>('idle')
  const [currentProductId, setCurrentProductId] = useState<number | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [loadingCreator, setLoadingCreator] = useState(true)

  // Product discovery state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Auth modal state
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  })

  // Memoized auth modal handlers to prevent rerenders
  const handleSignUp = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'signup' })
  }, [])

  const handleSignIn = useCallback(() => {
    setAuthModal({ isOpen: true, mode: 'signin' })
  }, [])

  const handleCloseAuth = useCallback(() => {
    setAuthModal({ isOpen: false, mode: 'signin' })
  }, [])

  // Get contracts for current chain
  const currentContracts = useMemo(() => getContracts(chainId), [chainId])

  const { writeContract: approveUSDC, data: approveHash } = useWriteContract()
  const { writeContract: buyProduct, data: buyHash } = useWriteContract()
  const { writeContract: faucetUSDC, data: faucetHash } = useWriteContract()

  // Wait for transactions
  const { isSuccess: approveSuccess, isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const { isSuccess: buySuccess, isLoading: isPurchasing } = useWaitForTransactionReceipt({
    hash: buyHash,
  })

  const { isSuccess: faucetSuccess, isLoading: isFauceting } = useWaitForTransactionReceipt({
    hash: faucetHash,
  })

  // Memoize query configurations to prevent re-creation and infinite loops
  const productsQuery = useMemo(() => ({
    enabled: true, // Always fetch products - users don't need wallet to browse
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: false as const, // Disable auto-refetch
  }), [chainId]); // Refetch when chain changes

  const usdcBalanceQuery = useMemo(() => ({
    enabled: !!isConnected && !!address,
    staleTime: 30 * 1000, // 30 seconds cache for balance
    refetchInterval: false as const,
  }), [isConnected, address, chainId]); // Refetch when chain changes

  // Fetch products from CreatorStore - only when connected
  const { data: contractProducts, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useReadContract({
    address: currentContracts.creatorStore,
    abi: CREATOR_STORE_ABI,
    functionName: 'getAllProducts',
    query: productsQuery
  })

  // Get user's MockUSDC balance - only when connected
  const { data: usdcBalance, refetch: refetchUSDCBalance } = useReadContract({
    address: currentContracts.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: usdcBalanceQuery
  })

  // Get user's allowance for CreatorStore - only when connected
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: currentContracts.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, currentContracts.creatorStore] : undefined,
    query: {
      enabled: !!isConnected && !!address,
      staleTime: 30 * 1000, // 30 seconds cache
      refetchInterval: false,
    }, // Will automatically refetch when address/chainId changes
  })

  // Get creator store owner - cached for 5 minutes
  const { data: creatorAddress } = useReadContract({
    address: currentContracts.creatorStore,
    abi: CREATOR_STORE_ABI,
    functionName: 'owner',
    query: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
    }, // Will automatically refetch when chainId changes
  })

  // Network-specific mock products (only used when no contract products exist)
  const mockProducts: Product[] = useMemo(() => {
    // Return empty array if on unknown network to force loading from contracts
    if (chainId !== 31337 && chainId !== 2810 && chainId !== 1) {
      return []
    }
    
    // Only show mock products for local development
    if (chainId === 31337) {
      return [
        {
          id: 1n,
          name: "Local Test Product",
          description: "This is a test product for local development",
          ipfsContentHash: "QmLocalTestHash",
          priceInUSDC: 100000n, // 0.1 USDC
          isActive: true,
          loyaltyBadgeId: 1n,
          category: "Test",
          views: 0,
          sales: 0,
          rating: 0
        }
      ]
    }
    
    // No mock products for live networks - force contract loading
    return []
  }, [chainId]);

  // Categories for filtering - Memoize if it's a constant array to prevent new array reference
  const categories = useMemo(() => [
    'all',
    'Art & Design',
    'Education & Tutorials',
    'Developer Tools',
    'Finance & Trading',
    'Music & Audio'
  ], []);

  // Price ranges for filtering - Memoize if it's a constant array
  const priceRanges = useMemo(() => [
    { value: 'all', label: 'All Prices' },
    { value: 'under-0.1', label: 'Under 0.1 USDC' },
    { value: '0.1-0.5', label: '0.1 - 0.5 USDC' },
    { value: '0.5-1', label: '0.5 - 1 USDC' },
    { value: 'over-1', label: 'Over 1 USDC' }
  ], []);

  // Helper function to enhance contract products with missing properties
  const enhanceContractProducts = useCallback((products: any[]): Product[] => {
    return products.map((product, index) => ({
      ...product,
      category: 'Digital Product', // Default category
      views: 0, // Real views (would come from analytics)
      sales: 0, // Real sales (would come from contract events)
      rating: 0 // Real rating (would come from user reviews)
    }))
  }, []);

  // Enhanced products with filtering and search
  const allProducts = useMemo(() => {
    if (contractProducts && contractProducts.length > 0) {
      return enhanceContractProducts(Array.from(contractProducts))
    }
    return mockProducts
  }, [contractProducts, enhanceContractProducts, mockProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!product.name.toLowerCase().includes(query) &&
          !product.description.toLowerCase().includes(query) &&
          !product.category?.toLowerCase().includes(query)) {
          return false
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false
      }

      // Price range filter
      if (priceRange !== 'all') {
        const priceInUSDC = parseFloat(formatUnits(product.priceInUSDC, 6))
        switch (priceRange) {
          case 'under-0.1':
            if (priceInUSDC >= 0.1) return false
            break
          case '0.1-0.5':
            if (priceInUSDC < 0.1 || priceInUSDC > 0.5) return false
            break
          case '0.5-1':
            if (priceInUSDC < 0.5 || priceInUSDC > 1) return false
            break
          case 'over-1':
            if (priceInUSDC <= 1) return false
            break
        }
      }

      return product.isActive
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(b.id) - Number(a.id)
        case 'oldest':
          return Number(a.id) - Number(b.id)
        case 'price-low':
          return Number(a.priceInUSDC) - Number(b.priceInUSDC)
        case 'price-high':
          return Number(b.priceInUSDC) - Number(a.priceInUSDC)
        case 'popular':
          return (b.sales || 0) - (a.sales || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy])

  // --- Moved proceedWithPurchase before handleBuyProduct ---
  const proceedWithPurchase = useCallback(async (productId: number) => {
    if (!address) {
      console.error('❌ No address available for purchase')
      return
    }

    try {
      console.log('🛒 Starting purchase for product ID:', productId)
      console.log('📍 Contract address:', currentContracts.creatorStore)
      console.log('🔗 Chain ID:', chainId)
      console.log('💰 Current allowance:', allowance?.toString())
      
      toast.loading('Processing purchase...', { id: 'purchase-toast' })

      const result = await buyProduct({
        address: currentContracts.creatorStore,
        abi: CREATOR_STORE_ABI,
        functionName: 'buyItem',
        args: [BigInt(productId)],
      })
      
      console.log('✅ Purchase transaction submitted:', result)
    } catch (error: any) {
      console.error('❌ Purchase failed:', error)
      console.error('Error details:', {
        message: error?.message,
        shortMessage: error?.shortMessage,
        cause: error?.cause,
        details: error?.details
      })
      
      setTransactionState('error')
      toast.dismiss('purchase-toast')
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-red-900">Purchase Failed</div>
          <div className="text-sm text-red-700">{error?.shortMessage || error?.message || 'Unknown error'}</div>
        </div>,
        {
          style: {
            background: 'oklch(var(--card))',
            border: '1px solid oklch(var(--destructive) / 0.3)',
            color: 'oklch(var(--destructive))',
          },
          duration: 5000
        }
      )

      setTimeout(() => {
        setTransactionState('idle')
        setCurrentProductId(null)
      }, 2000)
    }
  }, [address, buyProduct, currentContracts.creatorStore, chainId])

  const handleBuyProduct = useCallback(async (productId: number, price: bigint) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (usdcBalance !== undefined && usdcBalance < price) {
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-red-900">Insufficient MockUSDC Balance</div>
          <div className="text-sm text-red-700">Use the faucet to get more USDC!</div>
        </div>,
        {
          style: {
            background: 'oklch(var(--card))',
            border: '1px solid oklch(var(--destructive) / 0.3)',
            color: 'oklch(var(--destructive))',
          },
          duration: 4000
        }
      )
      return
    }

    setCurrentProductId(productId)

    if (allowance !== undefined && allowance < price) {
      setTransactionState('approving')

      try {
        toast.loading('Approving MockUSDC spend...', { id: 'approve-toast' })

        await approveUSDC({
          address: currentContracts.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [currentContracts.creatorStore, price],
        })
      } catch (error: any) {
        console.error('Approval failed:', error)
        setTransactionState('error')
        toast.dismiss('approve-toast')
        toast.error(`Approval failed: ${error?.shortMessage || 'Unknown error'}`)

        setTimeout(() => {
          setTransactionState('idle')
          setCurrentProductId(null)
        }, 2000)
      }
    } else {
      setTransactionState('purchasing')
      proceedWithPurchase(productId) // This call is now valid
    }
  }, [address, usdcBalance, allowance, approveUSDC, proceedWithPurchase])
  // --- End of reordered functions ---


  // Fetch creator profile - FIXED to prevent infinite loops
  useEffect(() => {
    if (!creatorAddress) {
      setCreatorProfile(null)
      setLoadingCreator(false)
      return
    }

    setLoadingCreator(true)
    
    // Use AuthService directly to avoid function recreation issues
    AuthService.getCreatorProfile(creatorAddress)
      .then(profile => {
        if (profile) {
          setCreatorProfile(profile)
        } else {
          setCreatorProfile({
            address: creatorAddress,
            displayName: 'Demo Creator',
            bio: 'Welcome to my KudoBit storefront! Explore my digital creations and earn loyalty badges.',
          })
        }
      })
      .catch(error => {
        console.error('Error fetching creator profile:', error)
        setCreatorProfile({
          address: creatorAddress,
          displayName: 'Demo Creator',
          bio: 'Welcome to my KudoBit storefront!',
        })
      })
      .finally(() => {
        setLoadingCreator(false)
      })
  }, [creatorAddress]) // Only depend on creatorAddress

  // Handle faucet success
  useEffect(() => {
    if (faucetSuccess) {
      toast.success('MockUSDC received! 🎉', { id: 'faucet-toast' })
      refetchUSDCBalance()
    }
  }, [faucetSuccess])

  // Handle approval success
  useEffect(() => {
    if (approveSuccess && transactionState === 'approving') {
      console.log('✅ Approval successful, proceeding with purchase...')
      toast.dismiss('approve-toast')
      setTransactionState('purchasing')
      
      // Refetch allowance and then proceed with purchase
      refetchAllowance().then(() => {
        if (currentProductId !== null) {
          console.log('🔄 Allowance refetched, starting purchase...')
          proceedWithPurchase(currentProductId)
        }
      }).catch(error => {
        console.error('Failed to refetch allowance:', error)
        if (currentProductId !== null) {
          proceedWithPurchase(currentProductId)
        }
      })
    }
  }, [approveSuccess, transactionState, currentProductId, proceedWithPurchase, refetchAllowance])

  // Handle purchase success
  useEffect(() => {
    if (buySuccess && transactionState === 'purchasing') {
      setTransactionState('success')
      setPurchaseSuccess(true)

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <div>
            <div className="font-semibold">Purchase Successful!</div>
            <div className="text-xs text-muted-foreground">⚡ Loyalty badge awarded instantly</div>
          </div>
        </div>,
        {
          duration: 5000,
          style: {
            background: 'oklch(var(--card))',
            borderLeft: '4px solid hsl(var(--primary))',
          },
          id: 'purchase-toast'
        }
      )

      refetchUSDCBalance()
      refetchProducts()

      setTimeout(() => {
        setTransactionState('idle')
        setCurrentProductId(null)
        setPurchaseSuccess(false)
      }, 3000)
    }
  }, [buySuccess, transactionState])

  const handleFaucet = useCallback(async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      toast.loading('Requesting MockUSDC from faucet...', { id: 'faucet-toast' })

      await faucetUSDC({
        address: currentContracts.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
        args: [1000n * 10n ** 6n], // 1000 USDC
      })
    } catch (error: any) {
      console.error('Faucet failed:', error)
      toast.dismiss('faucet-toast')
      toast.error(`Faucet failed: ${error?.shortMessage || 'Unknown error'}`)
    }
  }, [address, faucetUSDC, currentContracts.mockUSDC])


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 font-sans tracking-normal">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full shadow-lg">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            <span className="text-primary">KudoBit</span> Marketplace
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            <span className="text-primary font-semibold">Discover Digital Creators</span><br />
            The <span className="text-primary font-semibold">Web3 Gumroad</span> - buy digital products with
            <span className="text-primary font-semibold"> instant loyalty rewards</span> on Morph.
          </p>

          {/* Search and Filter Interface */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20 p-4 sm:p-6 shadow-lg">
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, creators, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-base border-primary/20 focus:border-primary/40 font-sans tracking-normal"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Price Range Filter */}
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full sm:w-[160px] border-primary/20">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort Options */}
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-full sm:w-[140px] border-primary/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-muted rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results Counter */}
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                </span>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setPriceRange('all')
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {address && usdcBalance !== undefined && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-card to-primary/10 rounded-lg px-4 sm:px-6 py-3 shadow-sm border border-primary/20">
                <div className="flex items-center gap-2 sm:gap-4">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">MockUSDC:</span>
                  <span className="text-sm sm:text-base font-semibold text-primary">
                    {formatUnits(usdcBalance || 0n, 6)} USDC
                  </span>
                </div>
              </div>

              <Button
                onClick={handleFaucet}
                size="sm"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
                disabled={isFauceting}
              >
                {isFauceting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Getting USDC...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Get MockUSDC
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              <span>Sub-$0.01 Fees</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-primary" />
              <span>True Fan Ownership</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Creator Sovereignty</span>
            </div>
          </div>
        </div>

        {/* Creator Profile Section */}
        {!loadingCreator && creatorProfile && (
          <div className="mb-12">
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <CardTitle className="text-base sm:text-lg md:text-xl">
                        {creatorProfile.displayName || 'Creator'}
                      </CardTitle>
                      {creatorProfile.isVerified && (
                        <Badge variant="secondary" className="bg-chart-1/10 text-green-800 border-green-200 text-xs w-fit">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {creatorProfile.address.slice(0, 6)}...{creatorProfile.address.slice(-4)}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {(creatorProfile.bio || (creatorProfile.socialLinks && Object.keys(creatorProfile.socialLinks).length > 0)) && (
                <CardContent className="pt-0">
                  {creatorProfile.bio && (
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {creatorProfile.bio}
                    </p>
                  )}

                  {creatorProfile.socialLinks && Object.keys(creatorProfile.socialLinks).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {creatorProfile.socialLinks.twitter && (
                        <a
                          href={`https://twitter.com/${creatorProfile.socialLinks.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/5 text-primary rounded-md hover:bg-primary/10 transition-colors"
                        >
                          <span>🐦</span>
                          {creatorProfile.socialLinks.twitter}
                          <ExternalLink className="h-2 w-2" />
                        </a>
                      )}
                      {creatorProfile.socialLinks.discord && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-md">
                          <span>💬</span>
                          {creatorProfile.socialLinks.discord}
                        </span>
                      )}
                      {creatorProfile.socialLinks.website && (
                        <a
                          href={creatorProfile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-chart-1/10 transition-colors"
                        >
                          <span>🌐</span>
                          Website
                          <ExternalLink className="h-2 w-2" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {!isConnected ? (
          <AppleHero
            onSignUp={handleSignUp}
            onSignIn={handleSignIn}
            isConnected={isConnected}
          />
        ) : (
          <AppleProducts
            products={filteredProducts}
            isLoading={productsLoading || isApproving || isPurchasing}
            onBuyProduct={handleBuyProduct}
            isTransacting={transactionState !== 'idle' || isApproving || isPurchasing}
            currentProductId={currentProductId}
          />
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseAuth}
        mode={authModal.mode}
        onSuccess={handleCloseAuth}
      />
    </div>
  )
}