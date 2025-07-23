import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Award, Zap, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi'
import { CONTRACTS, SHOPFRONT_ABI, MOCK_USDC_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: Shop,
})

type TransactionState = 'idle' | 'checking' | 'approving' | 'approved' | 'purchasing' | 'success' | 'error'

function Shop() {
  const { address, isConnected } = useAccount()
  const [transactionState, setTransactionState] = useState<TransactionState>('idle')
  const [currentItemId, setCurrentItemId] = useState<number | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  
  const { writeContract: approve, data: approveHash } = useWriteContract()
  const { writeContract: buyItem, data: buyHash } = useWriteContract()
  
  // Wait for approval transaction
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Wait for buy transaction  
  const { isSuccess: buySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  })

  // Fetch all items from the shop
  const { data: items, isLoading: itemsLoading } = useReadContract({
    address: CONTRACTS.shopfront,
    abi: SHOPFRONT_ABI,
    functionName: 'getAllItems',
  })

  // Get user's USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Get user's Morph ETH balance
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: address,
  })

  // Get user's allowance for the shopfront contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.shopfront] : undefined,
  })

  // Handle approval success
  useEffect(() => {
    if (approveSuccess && transactionState === 'approving') {
      setTransactionState('approved')
      toast.success('Approval successful!', {
        icon: <CheckCircle className="h-4 w-4" />,
      })
      refetchAllowance()
      
      // Auto-proceed to purchase
      setTimeout(() => {
        if (currentItemId) {
          proceedWithPurchase(currentItemId)
        }
      }, 1000)
    }
  }, [approveSuccess, transactionState, currentItemId])

  // Handle purchase success
  useEffect(() => {
    if (buySuccess && transactionState === 'purchasing') {
      setTransactionState('success')
      setPurchaseSuccess(true)
      
      // Emphasis on Morph's speed with animated success message
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-morph-green-500" />
          <div>
            <div className="font-semibold">Payment Successful!</div>
            <div className="text-xs text-muted-foreground">⚡ Lightning fast on Morph</div>
          </div>
        </div>,
        {
          duration: 5000,
          style: {
            background: 'linear-gradient(90deg, #f0fdf4 0%, #faf5ff 100%)',
            borderLeft: '4px solid #22c55e',
          }
        }
      )
      
      refetchBalance()
      refetchEthBalance()
      
      // Reset state after delay
      setTimeout(() => {
        setTransactionState('idle')
        setCurrentItemId(null)
        setPurchaseSuccess(false)
      }, 3000)
    }
  }, [buySuccess, transactionState])

  const proceedWithPurchase = async (itemId: number) => {
    if (!address) return
    
    try {
      setTransactionState('purchasing')
      setCurrentItemId(itemId)
      
      toast.loading('Processing payment...', {
        id: 'purchase-toast',
      })
      
      await buyItem({
        address: CONTRACTS.shopfront,
        abi: SHOPFRONT_ABI,
        functionName: 'buyItem',
        args: [BigInt(itemId)],
      })
    } catch (error: any) {
      console.error('Purchase failed:', error)
      setTransactionState('error')
      toast.dismiss('purchase-toast')
      toast.error(`Purchase failed: ${error?.shortMessage || 'Unknown error'}`)
      
      setTimeout(() => {
        setTransactionState('idle')
        setCurrentItemId(null)
      }, 2000)
    }
  }

  const handleBuyItem = async (itemId: number, price: bigint) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    // Check if user has enough USDC
    if (usdcBalance && usdcBalance < price) {
      toast.error('Insufficient USDC balance')
      return
    }

    setCurrentItemId(itemId)
    setTransactionState('checking')
    
    // Check if approval is needed
    const needsApproval = !allowance || allowance < price
    
    if (needsApproval) {
      try {
        setTransactionState('approving')
        toast.loading('Waiting for approval...', {
          id: 'approval-toast',
        })
        
        await approve({
          address: CONTRACTS.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.shopfront, price],
        })
        
        toast.dismiss('approval-toast')
      } catch (error: any) {
        console.error('Approval failed:', error)
        setTransactionState('error')
        toast.dismiss('approval-toast')
        toast.error(`Approval failed: ${error?.shortMessage || 'Unknown error'}`)
        
        setTimeout(() => {
          setTransactionState('idle')
          setCurrentItemId(null)
        }, 2000)
        return
      }
    } else {
      // Already approved, proceed directly to purchase
      proceedWithPurchase(itemId)
    }
  }

  const getBadgeColor = (badgeId: number) => {
    switch (badgeId) {
      case 1: return 'bg-amber-100 text-amber-800'
      case 2: return 'bg-gray-100 text-gray-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBadgeName = (badgeId: number) => {
    switch (badgeId) {
      case 1: return 'Bronze Badge'
      case 2: return 'Silver Badge'
      case 3: return 'Gold Badge'
      case 4: return 'Diamond Badge'
      default: return 'Badge'
    }
  }

  const getButtonContent = (itemId: number) => {
    if (currentItemId === itemId) {
      switch (transactionState) {
        case 'checking':
          return (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking...
            </span>
          )
        case 'approving':
          return (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Waiting for approval...</span>
              <span className="sm:hidden">Approving</span>
            </span>
          )
        case 'approved':
          return (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-morph-green-500" />
              <span className="hidden sm:inline">Approval successful!</span>
              <span className="sm:hidden">Approved</span>
            </span>
          )
        case 'purchasing':
          return (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Processing payment...</span>
              <span className="sm:hidden">Buying</span>
            </span>
          )
        case 'success':
          return (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-morph-green-500" />
              Success!
            </span>
          )
        case 'error':
          return (
            <span className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-red-500" />
              Failed
            </span>
          )
      }
    }
    return 'Buy Now'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="flex justify-center mb-4 sm:mb-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-3 sm:p-4 bg-gradient-to-br from-morph-green-100 to-morph-purple-100 dark:from-morph-green-900/30 dark:to-morph-purple-900/30 rounded-full shadow-lg"
            >
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-morph-green-600 dark:text-morph-green-400" />
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2"
          >
            <span className="bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
              Morph Commerce
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-2"
          >
            Experience <span className="text-morph-green-600 font-semibold">lightning-fast</span>, 
            <span className="text-morph-purple-600 font-semibold"> low-cost</span> digital commerce on Morph's hybrid rollup. 
            Buy digital items and earn loyalty badges <span className="text-morph-green-600 font-semibold">instantly</span>.
          </motion.p>
          
          <AnimatePresence>
            {address && (ethBalance || usdcBalance) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center mb-6 sm:mb-8"
              >
                <div className="bg-gradient-to-r from-card to-morph-green-50/50 dark:to-morph-green-900/10 rounded-lg px-4 sm:px-6 py-3 shadow-sm border border-morph-green-200/50">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Zap className="h-4 w-4 text-morph-green-500" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Balances:</span>
                    {ethBalance && (
                      <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                        {parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)} {ethBalance.symbol}
                      </span>
                    )}
                    {ethBalance && usdcBalance && (
                      <span className="text-xs text-muted-foreground">•</span>
                    )}
                    {usdcBalance && (
                      <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                        {formatUnits(usdcBalance, 6)} USDC
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Morph Advantage Highlight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center items-center gap-6 text-xs sm:text-sm text-muted-foreground mb-8"
          >
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-morph-green-500" />
              <span>Hybrid Rollup</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3 text-morph-purple-500" />
              <span>Decentralized Sequencer</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-morph-green-500" />
              <span>Instant Finality</span>
            </div>
          </motion.div>
        </motion.div>

        {!isConnected ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 sm:p-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-morph-green-100 to-morph-purple-100 dark:from-morph-green-900/30 dark:to-morph-purple-900/30 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-morph-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                Connect Your Wallet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground px-2 mb-6">
                Connect your wallet to experience lightning-fast digital commerce and earn instant loyalty badges on Morph
              </p>
              <div className="text-xs text-muted-foreground">
                🔥 Powered by Morph's Hybrid Rollup Technology
              </div>
            </div>
          </motion.div>
        ) : itemsLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-morph-green-500" />
            <p className="text-sm sm:text-base text-muted-foreground">Loading digital products...</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          >
            {items?.map((item, index) => (
              <motion.div
                key={item.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-morph-green-200/20 hover:border-morph-green-300/40 hover:scale-[1.02] cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 flex items-center justify-center relative group overflow-hidden">
                    {/* Product specific imagery */}
                    {item.id.toString() === '1' && (
                      <div className="text-6xl group-hover:scale-110 transition-transform">🖼️</div>
                    )}
                    {item.id.toString() === '2' && (
                      <div className="text-6xl group-hover:scale-110 transition-transform">🎫</div>
                    )}
                    {item.id.toString() === '3' && (
                      <div className="text-6xl group-hover:scale-110 transition-transform">📦</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-morph-green-500/10 to-morph-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-base">
                      <span className="line-clamp-2 font-semibold">{item.name}</span>
                      <Badge className={`${getBadgeColor(Number(item.loyaltyBadgeId))} text-xs shrink-0 border`}>
                        <Award className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        <span className="hidden sm:inline">{getBadgeName(Number(item.loyaltyBadgeId))}</span>
                        <span className="sm:hidden">{getBadgeName(Number(item.loyaltyBadgeId)).split(' ')[0]}</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm line-clamp-2">{item.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                        {formatUnits(item.priceInUSDC, 6)} USDC
                      </span>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-morph-green-500" />
                        Instant
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-3 sm:p-6 pt-0">
                    <Button
                      className="w-full text-xs sm:text-sm bg-gradient-to-r from-morph-green-500 to-morph-green-600 hover:from-morph-green-600 hover:to-morph-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                      size="sm"
                      onClick={() => handleBuyItem(Number(item.id), item.priceInUSDC)}
                      disabled={transactionState !== 'idle' || !item.isActive}
                    >
                      {getButtonContent(Number(item.id))}
                    </Button>
                  </CardFooter>
                  
                  {/* Success Overlay */}
                  <AnimatePresence>
                    {currentItemId === Number(item.id) && purchaseSuccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-morph-green-500/20 backdrop-blur-sm flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="bg-morph-green-500 text-white p-3 rounded-full shadow-lg"
                        >
                          <CheckCircle className="h-8 w-8" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Bottom CTA for non-connected users */}
        {!isConnected && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 p-6 bg-gradient-to-r from-morph-green-50/50 to-morph-purple-50/50 dark:from-morph-green-900/10 dark:to-morph-purple-900/10 rounded-lg border border-morph-green-200/30"
          >
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
              Ready to experience the future of digital commerce?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your wallet to start buying digital items with <strong>instant finality</strong> and <strong>ultra-low fees</strong> on Morph
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
              <span>⚡ Lightning Fast</span>
              <span>💰 Ultra Low Fees</span>
              <span>🔒 Secure & Transparent</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}