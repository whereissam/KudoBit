import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Zap, CheckCircle, Loader2, User, Package, Award } from 'lucide-react'
import { useReadContract, useAccount, useBalance } from 'wagmi'
import { CONTRACTS, PRODUCT_NFT_ABI, MOCK_USDC_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: Shop,
})

function Shop() {
  const { address, isConnected } = useAccount()

  // Get total product count from ProductNFT
  const { data: productCounter, isLoading: counterLoading } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'productCounter',
  })

  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: ethBalance } = useBalance({ address })

  // Generate array of product IDs to fetch
  const productIds = productCounter ? Array.from({ length: Number(productCounter) }, (_, i) => i + 1) : []

  // const formatAddress = (addr: string) => {
  //   if (!addr) return ''
  //   return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  // }

  // const getProductEmoji = (productId: number) => {
  //   const emojis = ['📄', '🖼️', '🎫', '📦', '🎨', '📚', '🎵', '📹', '🎮', '🔧']
  //   return emojis[productId % emojis.length]
  // }

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
              KudoBit
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
        ) : counterLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-morph-green-500" />
            <p className="text-sm sm:text-base text-muted-foreground">Loading products...</p>
          </motion.div>
        ) : productIds.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12"
          >
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a product on this marketplace!</p>
            <Link to="/creator">
              <Button>
                <User className="h-4 w-4 mr-2" />
                Become a Creator
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          >
            {productIds.map((productId, index) => (
              <ProductCard key={productId} productId={productId} index={index} />
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

// Simple ProductCard component that fetches individual product data
function ProductCard({ productId, index }: { productId: number; index: number }) {
  const { address } = useAccount()
  const { data: product } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'products',
    args: [BigInt(productId)],
  })

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getProductEmoji = (productId: number) => {
    const emojis = ['📄', '🖼️', '🎫', '📦', '🎨', '📚', '🎵', '📹', '🎮', '🔧']
    return emojis[productId % emojis.length]
  }

  if (!product) return null

  const [name, description, price, active, creator] = product

  if (!active) return null // Don't show inactive products

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-morph-green-200/20 hover:border-morph-green-300/40 hover:scale-[1.02]">
        <Link to={`/product/${productId}`}>
          <div className="aspect-video bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 flex items-center justify-center relative group overflow-hidden">
            <div className="text-6xl group-hover:scale-110 transition-transform">
              {getProductEmoji(productId)}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-morph-green-500/10 to-morph-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-base">
              <span className="line-clamp-2 font-semibold">{name}</span>
              <Badge variant="outline" className="text-xs shrink-0">
                <User className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                {formatAddress(creator)}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-2">{description}</CardDescription>
          </CardHeader>
          
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                {formatUnits(price, 6)} USDC
              </span>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-morph-green-500" />
                NFT
              </div>
            </div>
          </CardContent>
        </Link>
        
        <div className="p-3 sm:p-6 pt-0">
          <Button 
            className="w-full" 
            size="sm"
            disabled={!address}
            asChild
          >
            <Link to={`/product/${productId}`}>
              {!address ? 'Connect Wallet' : 'View Details'}
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}