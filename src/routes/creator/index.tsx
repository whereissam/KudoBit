import { createFileRoute, Link } from '@tanstack/react-router'
import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Plus,
  BarChart3,
  Download,
} from 'lucide-react'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { CONTRACTS, PRODUCT_NFT_ABI, CREATOR_REGISTRY_ABI } from '@/lib/contracts'

export const Route = createFileRoute('/creator/')({
  component: CreatorIndex,
})

function CreatorIndex() {
  const { address, isConnected } = useAccount()

  // Read creator profile from chain
  const { data: creatorData } = useReadContract({
    address: CONTRACTS.creatorRegistry,
    abi: CREATOR_REGISTRY_ABI,
    functionName: 'creators',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  // Read creator's product IDs from chain
  const { data: productIds } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'getCreatorProducts',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to access the creator dashboard
          </p>
        </div>
      </div>
    )
  }

  const products = (productIds as bigint[]) || []
  const totalProducts = products.length
  const totalSales = creatorData ? Number((creatorData as any)[5] || 0) : 0
  const productCount = creatorData ? Number((creatorData as any)[4] || 0) : 0

  const quickStats = [
    {
      title: 'Products',
      value: (productCount || totalProducts).toString(),
      icon: Package,
    },
    {
      title: 'Sales',
      value: totalSales.toString(),
      icon: TrendingUp,
    },
    {
      title: 'Customers',
      value: totalSales > 0 ? totalSales.toString() : '0',
      icon: Users,
    },
    {
      title: 'Earnings',
      value: 'View',
      icon: DollarSign,
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your products and track your sales
            </p>
          </div>
          <Link to="/creator/create-product">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Manage Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Create, edit, and manage your digital products
              </p>
              <Link to="/creator/create-product">
                <Button variant="outline" size="sm" className="w-full">
                  Create Product
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                View detailed sales and performance analytics
              </p>
              <Link to="/creator/earnings">
                <Button variant="outline" size="sm" className="w-full">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Track earnings and withdraw your revenue
              </p>
              <Link to="/creator/earnings">
                <Button variant="outline" size="sm" className="w-full">
                  View Earnings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Overview of your published products
                </CardDescription>
              </div>
              <Link to="/creator/create-product">
                <Button variant="outline" size="sm">
                  Create New
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first product to start selling
                </p>
                <Link to="/creator/create-product">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((productId, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Product #{productId.toString()}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>NFT ID: {productId.toString()}</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </div>
                    <Link to="/product/$id" params={{ id: productId.toString() }}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
