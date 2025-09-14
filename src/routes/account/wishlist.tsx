import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, HeartOff, ShoppingCart, User, Package, Trash2, Share } from 'lucide-react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/account/wishlist')({
  component: WishlistPage,
})

// Mock wishlist data - in a real app this would be stored on-chain or in localStorage
const mockWishlistItems = [
  {
    id: '1',
    productId: 3,
    productName: 'UI/UX Design Templates',
    creator: '0xABCD...1234',
    price: '15.75',
    description: 'Modern UI/UX design templates for web and mobile applications',
    emoji: '🎨',
    addedDate: '2024-01-20T09:15:00Z'
  },
  {
    id: '2',
    productId: 4,
    productName: 'Photography Preset Pack',
    creator: '0xDEFG...5678',
    price: '8.50',
    description: 'Professional photography presets for Lightroom and Photoshop',
    emoji: '📸',
    addedDate: '2024-01-18T16:42:00Z'
  },
  {
    id: '3',
    productId: 5,
    productName: 'Code Snippets Collection',
    creator: '0xHIJK...9012',
    price: '12.00',
    description: 'Reusable code snippets for React, TypeScript, and Node.js',
    emoji: '💻',
    addedDate: '2024-01-15T11:28:00Z'
  }
]

function WishlistPage() {
  const { isConnected } = useAccount()
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))
  }

  const getTotalValue = () => {
    return wishlistItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)
  }

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
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline">
                {getTotalValue()} USDC total
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
                {wishlistItems.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-morph-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-morph-green-600">
                {getTotalValue()} USDC
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <Package className="h-4 w-4 text-morph-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-morph-purple-600">
                {wishlistItems.length > 0 ? (parseFloat(getTotalValue()) / wishlistItems.length).toFixed(2) : '0.00'} USDC
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
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
                    onClick={() => setWishlistItems([])}
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
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Product Image/Emoji */}
                          <div className="w-16 h-16 bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                            {item.emoji}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg hover:text-morph-green-600 transition-colors">
                                  <Link to={`/product/${item.productId}`}>
                                    {item.productName}
                                  </Link>
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <User className="h-3 w-3" />
                                  <span>{formatAddress(item.creator)}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromWishlist(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-lg font-bold text-morph-green-600 mb-1">
                                  {item.price} USDC
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Added {formatDate(item.addedDate)}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/product/${item.productId}`}>
                                    View
                                  </Link>
                                </Button>
                                <Button size="sm" asChild>
                                  <Link to={`/product/${item.productId}`}>
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
            {wishlistItems.length > 0 && (
              <Button variant="outline">
                Buy All ({getTotalValue()} USDC)
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}