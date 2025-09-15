import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Share, Trash2 } from 'lucide-react'

interface WishlistContentProps {
  children: React.ReactNode
  wishlistCount: number
}

export function WishlistContent({ children, wishlistCount }: WishlistContentProps) {
  return (
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
          {children}
        </AnimatePresence>
      </motion.div>

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
    </>
  )
}