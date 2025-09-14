import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Download, Calendar, User, Package, ExternalLink } from 'lucide-react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/account/purchases')({
  component: PurchaseHistory,
})

// Mock purchase data - in a real app this would come from blockchain events or a backend
const mockPurchases = [
  {
    id: '1',
    productId: 1,
    productName: 'Digital Art Collection',
    creator: '0x1234...5678',
    price: '10.50',
    purchaseDate: '2024-01-15T10:30:00Z',
    status: 'completed',
    downloadable: true,
    emoji: '🎨'
  },
  {
    id: '2', 
    productId: 2,
    productName: 'Music Beat Pack',
    creator: '0x9876...4321',
    price: '25.00',
    purchaseDate: '2024-01-10T14:22:00Z',
    status: 'completed',
    downloadable: true,
    emoji: '🎵'
  }
]

function PurchaseHistory() {
  const { isConnected } = useAccount()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-morph-green-100 to-morph-purple-100 dark:from-morph-green-900/30 dark:to-morph-purple-900/30 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-morph-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to view your purchase history
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                  My Purchases
                </span>
              </h1>
              <p className="text-muted-foreground">View and manage your digital purchases</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/account">← Back to Account</Link>
            </Button>
          </div>
        </motion.div>

        {/* Purchase Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-morph-green-600">
                {mockPurchases.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-morph-purple-600">
                {mockPurchases.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2)} USDC
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Downloadable Items</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockPurchases.filter(p => p.downloadable).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase List */}
        {mockPurchases.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-12"
          >
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-6">
              Discover amazing digital products and make your first purchase!
            </p>
            <Button asChild>
              <Link to="/discover">Browse Products</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold mb-4">Purchase History</h2>
            {mockPurchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image/Emoji */}
                      <div className="w-16 h-16 bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 rounded-lg flex items-center justify-center text-2xl">
                        {purchase.emoji}
                      </div>

                      {/* Purchase Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{purchase.productName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{purchase.creator}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-morph-green-600">
                              {purchase.price} USDC
                            </div>
                            <Badge 
                              variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {purchase.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(purchase.purchaseDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>Product #{purchase.productId}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" asChild>
                            <Link to="/product/$id" params={{ id: purchase.productId.toString() }}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Product
                            </Link>
                          </Button>
                          
                          {purchase.downloadable && (
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}

                          <Button variant="outline" size="sm">
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 p-6 bg-gradient-to-r from-morph-green-50/50 to-morph-purple-50/50 dark:from-morph-green-900/10 dark:to-morph-purple-900/10 rounded-lg border border-morph-green-200/30"
        >
          <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
            Discover More Amazing Products
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Explore thousands of digital products from talented creators
          </p>
          <Button asChild>
            <Link to="/discover">Browse Marketplace</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}