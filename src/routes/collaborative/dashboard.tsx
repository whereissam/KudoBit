import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useCollaborativeProducts } from '@/hooks/use-collaborative'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Vote,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react'

interface CollaborativeProduct {
  id: number
  productId: number
  name: string
  description: string
  priceUsdc: string
  isActive: boolean
  totalSales: string
  myRole: string
  myContribution: number
  isActiveCollaborator: boolean
  createdAt: string
}

interface DashboardSummary {
  totalProducts: number
  totalEarnings: string
  totalPurchases: number
  uniqueCustomers: number
}

interface RoyaltyDistribution {
  id: number
  amount_usdc: string
  role: string
  product_name: string
  purchase_date: string
}

export const Route = createFileRoute('/collaborative/dashboard')({
  component: CollaborativeDashboard,
})

function CollaborativeDashboard() {
  const { address, isConnected } = useAccount()
  const {
    productCount,
    earnings,
    isLoading: loading,
    contractDeployed,
  } = useCollaborativeProducts()

  // Build summary from contract data
  const summary: DashboardSummary | null = contractDeployed ? {
    totalProducts: productCount,
    totalEarnings: earnings ? formatUnits(earnings, 6) : '0',
    totalPurchases: 0, // needs indexer
    uniqueCustomers: 0, // needs indexer
  } : null

  // Product list and distributions need indexed data — empty for now
  const products: CollaborativeProduct[] = []
  const recentDistributions: RoyaltyDistribution[] = []
  const error = ''

  const formatPrice = (price: string | number) => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price
    return (priceNum / 1000000).toFixed(6) // Convert from 6 decimal places
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view your collaborative dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-border rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-border rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-border rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Collaborative Dashboard</h1>
          <p className="text-muted-foreground">Manage your collaborative products and track earnings</p>
        </div>
        <Link to="/collaborative/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Product
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{summary.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${formatPrice(summary.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sales</p>
                  <p className="text-2xl font-bold">{summary.totalPurchases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-4/10 rounded-lg">
                  <Users className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">{summary.uniqueCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Your Collaborative Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No collaborative products yet</p>
                <Link to="/collaborative/create">
                  <Button>Create Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium mb-1">{product.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{product.myRole}</Badge>
                          <span>•</span>
                          <span>{(product.myContribution / 100).toFixed(1)}% share</span>
                        </div>
                      </div>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>Price: ${formatPrice(product.priceUsdc)} USDC</span>
                      <span>Sales: ${formatPrice(product.totalSales)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link to={`/collaborative/products/${product.id}`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/collaborative/products/${product.id}/analytics`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          Analytics
                        </Button>
                      </Link>
                      <Link to={`/collaborative/proposals/${product.id}`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Vote className="w-3 h-3" />
                          Proposals
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Recent Royalty Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDistributions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">No earnings yet</p>
                <p className="text-sm text-muted-foreground">
                  Start collaborating on products to earn royalties!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDistributions.map((distribution, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{distribution.product_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {distribution.role}
                        </Badge>
                        <span>•</span>
                        <span>{formatDate(distribution.purchase_date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-chart-1">
                        +${formatPrice(distribution.amount_usdc)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/collaborative/create">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Product
              </Button>
            </Link>
            <Link to="/collaborative/browse">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Browse Collaborations
              </Button>
            </Link>
            <Link to="/collaborative/earnings">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                View Full Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}