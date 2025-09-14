import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { Plus, TrendingUp, Users, DollarSign, Eye, Package, Settings, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { AnalyticsService } from '@/lib/analytics-service'

interface AppleDashboardProps {
  creatorProfile?: {
    displayName: string
    bio?: string
    address: string
  }
}

interface DashboardStats {
  totalRevenue: string
  productsSold: string
  activeFans: string
  profileViews: string
  recentProducts: Array<{
    name: string
    sales: number
    revenue: string
  }>
}

export function AppleDashboard({ creatorProfile }: AppleDashboardProps) {
  const navigate = useNavigate()
  const { address } = useAccount()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      loadDashboardData()
    }
  }, [address])

  const loadDashboardData = async () => {
    if (!address) return
    
    try {
      setLoading(true)
      setError(null)
      const analytics = await AnalyticsService.getCreatorAnalytics(address)
      
      setDashboardStats({
        totalRevenue: `$${analytics.totalRevenue}`,
        productsSold: analytics.productsSold.toString(),
        activeFans: analytics.activeFans.toString(),
        profileViews: analytics.profileViews.toString(),
        recentProducts: analytics.recentProducts.map(p => ({
          ...p,
          revenue: `$${p.revenue}`
        }))
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
      // Show REAL ZERO data instead of fake data
      setDashboardStats({
        totalRevenue: '$0.00',
        productsSold: '0',
        activeFans: '0',
        profileViews: '0',
        recentProducts: []
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = dashboardStats ? [
    {
      label: 'Total Revenue',
      value: dashboardStats.totalRevenue,
      change: null, // No fake percentages
      changeType: null,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Products Sold',
      value: dashboardStats.productsSold,
      change: null, // No fake percentages
      changeType: null, 
      icon: Package,
      color: 'blue'
    },
    {
      label: 'Active Fans',
      value: dashboardStats.activeFans,
      change: null, // No fake percentages
      changeType: null,
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Profile Views',
      value: dashboardStats.profileViews,
      change: null, // No fake percentages
      changeType: null,
      icon: Eye,
      color: 'orange'
    }
  ] : []

  const recentProducts = dashboardStats?.recentProducts || []

  return (
    <div className="bg-muted/30 min-h-screen font-sans tracking-normal">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {creatorProfile?.displayName || 'Creator'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {loading ? 'Loading your dashboard...' : error ? 'Error loading data - showing cached data' : "Here's what's happening with your products today."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-border hover:border-gray-400 text-foreground"
                onClick={() => navigate({ to: '/creator/profile' })}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="border-border hover:border-gray-400 text-foreground"
                onClick={loadDashboardData}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Refresh
              </Button>
              <Button 
                variant="outline"
                className="border-border hover:border-gray-400 text-foreground"
                onClick={() => navigate({ to: '/creator/create-perk' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Perk
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => navigate({ to: '/creator/create-product' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-background rounded-2xl p-6 shadow-md border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-muted rounded-xl animate-pulse"></div>
                  <div className="w-12 h-4 bg-muted rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="w-20 h-8 bg-muted rounded mb-1 animate-pulse"></div>
                  <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
            <div key={index} className="bg-background rounded-2xl p-6 shadow-md border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'green' ? 'bg-chart-1/10' :
                  stat.color === 'blue' ? 'bg-primary/10' :
                  stat.color === 'purple' ? 'bg-chart-3/10' :
                  'bg-chart-4/10'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'green' ? 'text-chart-1' :
                    stat.color === 'blue' ? 'text-primary' :
                    stat.color === 'purple' ? 'text-chart-3' :
                    'text-chart-4'
                  }`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-chart-1' : 'text-destructive'
                }`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-background rounded-2xl shadow-md border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Recent Products</h2>
                <p className="text-muted-foreground text-sm mt-1">Your latest product performance</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    // Loading skeleton for products
                    [...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-muted rounded-lg mr-4 animate-pulse"></div>
                          <div>
                            <div className="w-32 h-4 bg-muted rounded mb-1 animate-pulse"></div>
                            <div className="w-20 h-3 bg-muted rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-4 bg-muted rounded mb-1 animate-pulse"></div>
                          <div className="w-12 h-3 bg-muted rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    recentProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sales} sales</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{product.revenue}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
                <Button variant="outline" className="w-full mt-6">
                  View All Products
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-background rounded-2xl shadow-md border border-border p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                  <span className="text-primary-foreground font-bold text-xl">
                    {creatorProfile?.displayName?.[0] || 'C'}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {creatorProfile?.displayName || 'Creator'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {creatorProfile?.address.slice(0, 6)}...{creatorProfile?.address.slice(-4)}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background rounded-2xl shadow-md border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate({ to: '/creator/create-product' })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate({ to: '/analytics/dashboard' })}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate({ to: '/creator/profile' })}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Profile
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-6 border border-primary/30">
              <div className="text-center">
                <div className="text-2xl mb-3">💡</div>
                <h3 className="font-semibold text-foreground mb-2">Pro Tip</h3>
                <p className="text-sm text-muted-foreground">
                  Engage with your fans regularly to build a loyal community and increase sales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}