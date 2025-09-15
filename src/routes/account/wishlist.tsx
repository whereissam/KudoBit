import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, HeartOff, ShoppingCart, User, Package, Trash2, Share, Loader2 } from 'lucide-react'
import { useAccount, useReadContract } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { useWishlist } from '@/hooks/use-wishlist'
import { CONTRACTS, PRODUCT_NFT_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'

export const Route = createFileRoute('/account/wishlist')({
  component: WishlistPage,
})

// Helper component to fetch product data
function ProductFromWishlist({ productId }: { productId: number }) {
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

  const { removeFromWishlist, isLoading } = useWishlist()

  if (!product) return null

  const [name, description, price, active, creator] = product

  if (!active) return null // Don't show inactive products

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card className="hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Product Image/Emoji */}
            <div className="w-16 h-16 bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
              {getProductEmoji(productId)}
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg hover:text-morph-green-600 transition-colors">
                    <Link to={`/product/${productId}`}>
                      {name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <User className="h-3 w-3" />
                    <span>{formatAddress(creator)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromWishlist(productId)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {description}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-morph-green-600 mb-1">
                    {formatUnits(price, 6)} USDC
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/product/${productId}`}>
                      View
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to={`/product/${productId}`}>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Buy Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function WishlistPage() {
  const { isConnected } = useAccount()
  const { wishlistItems, wishlistCount, isLoading: wishlistLoading } = useWishlist()

  // Calculate stats from real data
  const wishlistProductIds = wishlistItems.map(id => Number(id))

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
        <div className="container mx-auto px-3 sm:px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to view and manage your wishlist
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
      <div className="container mx-auto px-3 sm:px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                  My Wishlist
                </span>
              </h1>
              <p className="text-muted-foreground">Items you want to purchase later</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" asChild>
              <Link to="/account">← Back to Account</Link>
            </Button>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {wishlistCount} item{wishlistCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Wishlist Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Items Saved</CardTitle>
              <Heart className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {wishlistCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
              <ShoppingCart className="h-4 w-4 text-morph-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-morph-green-600">
                {wishlistProductIds.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Ready to Buy</CardTitle>
              <Package className="h-4 w-4 text-morph-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-morph-purple-600">
                {wishlistCount > 0 ? 'Yes' : 'No'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wishlist Items */}
        {wishlistLoading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-12"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-morph-green-500" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </motion.div>
        ) : wishlistCount === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-12"
          >
            <HeartOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Browse products and save items you're interested in for later!
            </p>
            <Button asChild>
              <Link to="/discover">Browse Products</Link>
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Bulk Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Saved Items</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share className="h-3 w-3 mr-1" />
                    Share Wishlist
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Items Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {wishlistProductIds.map((productId, index) => (
                  <ProductFromWishlist key={productId} productId={productId} />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 p-6 bg-gradient-to-r from-morph-green-50/50 to-morph-purple-50/50 dark:from-morph-green-900/10 dark:to-morph-purple-900/10 rounded-lg border border-morph-green-200/30"
        >
          <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
            Ready to make a purchase?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse more products or purchase items from your wishlist
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild>
              <Link to="/discover">Discover More</Link>
            </Button>
            {wishlistCount > 0 && (
              <Button variant="outline" disabled>
                Buy All (Coming Soon)
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}