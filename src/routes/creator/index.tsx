import { createFileRoute, Link } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { useCreator } from '@/hooks/use-creator'
import { useEffect } from 'react'
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
  Star
} from 'lucide-react'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/creator/')({
  component: CreatorDashboard,
})

function CreatorDashboard() {
  const { address, isConnected } = useAccount()
  const { products, earnings, loadCreatorData, claimEarnings, isLoading } = useCreator()

  useEffect(() => {
    if (isConnected && address) {
      loadCreatorData()
    }
  }, [isConnected, address, loadCreatorData])

  // const { data: items } = useReadContract({
  //   address: CONTRACTS.shopfront,
  //   abi: SHOPFRONT_ABI,
  //   functionName: 'getAllItems',
  // })

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

  const totalProducts = products.length
  const totalRevenue = Object.values(earnings).reduce((sum, amount) => sum + BigInt(amount || '0'), BigInt('0'))
  const totalSales = 42 // This would come from analytics contract
  const totalCustomers = 28 // This would come from analytics contract

  const quickStats = [
    {
      title: 'Total Revenue',
      value: `${formatUnits(totalRevenue, 6)} USDC`,
      icon: DollarSign,
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Products',
      value: totalProducts.toString(),
      icon: Package,
      change: '+2',
      trend: 'up'
    },
    {
      title: 'Sales',
      value: totalSales.toString(),
      icon: TrendingUp,
      change: '+8',
      trend: 'up'
    },
    {
      title: 'Customers',
      value: totalCustomers.toString(),
      icon: Users,
      change: '+5',
      trend: 'up'
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
          <Link to="/creator/products/new">
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
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </p>
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
              <Link to="/creator/products">
                <Button variant="outline" size="sm" className="w-full">
                  View Products
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
              <Link to="/creator/analytics">
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

        {/* Earnings Section */}
        {Object.keys(earnings).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Earnings</CardTitle>
              <CardDescription>
                Withdraw your earned revenue from product sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(earnings).map(([token, amount]) => (
                  amount && amount !== '0' ? (
                    <div key={token} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatUnits(BigInt(amount), 6)} USDC</p>
                        <p className="text-sm text-muted-foreground">Token: {token.slice(0, 6)}...{token.slice(-4)}</p>
                      </div>
                      <Button 
                        onClick={() => claimEarnings()}
                        disabled={isLoading}
                        size="sm"
                      >
                        {isLoading ? 'Claiming...' : 'Claim'}
                      </Button>
                    </div>
                  ) : null
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Overview of your published products
                </CardDescription>
              </div>
              <Link to="/creator/products">
                <Button variant="outline" size="sm">
                  View All
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
                <Link to="/creator/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 3).map((product, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Product #{product}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>NFT ID: {product}</span>
                          <Badge variant="default">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm">
                        <p className="font-medium">View Details</p>
                        <p className="text-muted-foreground">On chain</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest sales and customer interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Sale: Exclusive Wallpaper NFT
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sold to 0x1234...5678 • 2 hours ago
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">10 USDC</p>
                    <div className="flex items-center text-xs text-yellow-600">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      5.0
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}