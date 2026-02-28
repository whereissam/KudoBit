import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Globe,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react'
import { AnalyticsService } from '@/lib/analytics-service'
import { LoadingSpinner } from '@/components/loading-states'
import { useChainId, useAccount } from 'wagmi'
import { getChainMetadata } from '@/lib/chains'

export const Route = createFileRoute('/analytics/dashboard')({
  component: AnalyticsDashboard
})

function AnalyticsDashboard() {
  const chainId = useChainId()
  const { address } = useAccount()
  
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['global-analytics', chainId],
    queryFn: () => AnalyticsService.getGlobalAnalytics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-morph-green-500" />
          <p className="text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Analytics Unavailable</h2>
          <p className="text-muted-foreground">Unable to load analytics data. Please try again later.</p>
        </div>
      </div>
    )
  }

  const currentChain = getChainMetadata(chainId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive insights across the KudoBit platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {currentChain?.name || 'Unknown Chain'}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Real-time
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chains">Multi-Chain</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={`$${analytics?.overview.totalRevenue || '0'}`}
                change="+12.5%"
                changeType="positive"
                icon={DollarSign}
              />
              <MetricCard
                title="Total Sales"
                value={analytics?.overview.totalSales.toLocaleString() || '0'}
                change="+8.2%"
                changeType="positive"
                icon={ShoppingCart}
              />
              <MetricCard
                title="Active Creators"
                value={analytics?.overview.activeCreators.toLocaleString() || '0'}
                change="+15.7%"
                changeType="positive"
                icon={Users}
              />
              <MetricCard
                title="Conversion Rate"
                value={`${analytics?.overview.conversionRate || '0'}%`}
                change="-2.1%"
                changeType="negative"
                icon={TrendingUp}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Revenue chart would be rendered here</p>
                  </div>
                </CardContent>
              </Card>

              {/* Loyalty Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Loyalty Badges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-chart-5 rounded-full"></div>
                        Bronze
                      </span>
                      <span>{analytics?.loyaltyStats.bronzeBadges || 0}</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        Silver
                      </span>
                      <span>{analytics?.loyaltyStats.silverBadges || 0}</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                        Gold
                      </span>
                      <span>{analytics?.loyaltyStats.goldBadges || 0}</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        Diamond
                      </span>
                      <span>{analytics?.loyaltyStats.diamondBadges || 0}</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topProducts.slice(0, 5).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-morph-green-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.revenue}</p>
                          <div className="flex items-center text-sm text-chart-2">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {product.growth}%
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No product data available</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Top Creators */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Creators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topCreators.slice(0, 5).map((creator, index) => (
                      <div key={creator.address} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-morph-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{creator.displayName}</p>
                            <p className="text-sm text-muted-foreground">{creator.products} products</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${creator.totalRevenue}</p>
                          <div className="flex items-center text-sm">
                            ⭐ {creator.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No creator data available</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Multi-Chain Tab */}
          <TabsContent value="chains" className="space-y-6">
            {/* Cross-Chain Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Chains"
                value={`${analytics?.crossChainMetrics.activeChains || 0}/${analytics?.crossChainMetrics.totalChains || 0}`}
                change="New deployment"
                changeType="neutral"
                icon={Globe}
              />
              <MetricCard
                title="Cross-Chain Txs"
                value={analytics?.crossChainMetrics.crossChainTxs.toLocaleString() || '0'}
                change="+45.2%"
                changeType="positive"
                icon={Activity}
              />
              <MetricCard
                title="Bridge Volume"
                value={`$${analytics?.crossChainMetrics.bridgeVolume || '0'}`}
                change="+23.1%"
                changeType="positive"
                icon={Zap}
              />
              <MetricCard
                title="Deployment Progress"
                value="85%"
                change="3 pending"
                changeType="neutral"
                icon={TrendingUp}
              />
            </div>

            {/* Chain Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Chain Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.chainAnalytics.map((chain) => (
                    <div key={chain.chainId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{chain.chainName}</h3>
                          <Badge variant="outline" className="text-xs">
                            Chain {chain.chainId}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${chain.revenue}</p>
                          <p className="text-sm text-muted-foreground">{chain.sales} sales</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Users</p>
                          <p className="font-medium">{chain.users}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Gas</p>
                          <p className="font-medium">{chain.avgGasCost}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Speed</p>
                          <p className="font-medium">{chain.transactionSpeed}</p>
                        </div>
                      </div>
                      <Progress value={chain.marketShare} className="mt-3 h-1" />
                    </div>
                  )) || <p className="text-muted-foreground">No chain data available</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed product performance analytics would be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators">
            <Card>
              <CardHeader>
                <CardTitle>Creator Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed creator performance analytics would be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  }[changeType]

  const ChangeIcon = changeType === 'positive' ? ArrowUpRight : 
                    changeType === 'negative' ? ArrowDownRight : Activity

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className={`flex items-center text-sm mt-1 ${changeColor}`}>
              <ChangeIcon className="h-3 w-3 mr-1" />
              {change}
            </div>
          </div>
          <div className="p-3 bg-morph-green-100 rounded-full">
            <Icon className="h-6 w-6 text-morph-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}