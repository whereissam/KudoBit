import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Heart, HeartOff, Loader2 } from 'lucide-react'

interface WishlistLoadingProps {
  message?: string
}

export function WishlistLoading({ message = "Loading your wishlist..." }: WishlistLoadingProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-12"
    >
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-monad-purple-500" />
      <p className="text-muted-foreground">{message}</p>
    </motion.div>
  )
}

export function WishlistEmpty() {
  return (
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
  )
}

export function WalletNotConnected() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-monad-purple-50/5 to-monad-cyan-50/5">
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