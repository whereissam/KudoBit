import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Package,
  Target,
  Globe,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalRevenue: string
    totalSales: number
    activeCreators: number
    totalCustomers: number
    averageOrderValue: string
    conversionRate: string
  }
  trends: {
    period: string
    revenue: number
    sales: number
    customers: number
  }[]
  topProducts: {
    id: number
    name: string
    creator: string
    sales: number
    revenue: string
    growth: number
  }[]
  topCreators: {
    address: string
    displayName: string
    totalSales: number
    totalRevenue: string
    products: number
    rating: number
  }[]
  loyaltyStats: {
    totalBadges: number
    bronzeBadges: number
    silverBadges: number
    goldBadges: number
    diamondBadges: number
    redemptionRate: string
  }
  geographicData: {
    country: string
    sales: number
    revenue: string
    percentage: number
  }[]
}

export const Route = createFileRoute('/analytics/dashboard')({
  component: AnalyticsDashboard,
})

function AnalyticsDashboard() {
  const { address, isConnected } = useAccount()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState('30d')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    try {
      // TODO: Replace with actual API calls to your backend
      const response = await fetch('/api/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return empty data structure when API fails
      return {
        overview: {
          totalRevenue: '0',
          totalSales: 0,
          activeCreators: 0,
          totalCustomers: 0,
          averageOrderValue: '0',
          conversionRate: '0'
        },
        trends: [],
        topProducts: [],
        topCreators: [],
        loyaltyStats: {
          totalBadges: 0,
          bronzeBadges: 0,
          silverBadges: 0,
          goldBadges: 0,
          diamondBadges: 0,
          redemptionRate: '0'
        },
        geographicData: []
      };
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [timeframe, category])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchAnalyticsData()
      setAnalyticsData(data)
    } catch (err) {
      console.error('Analytics loading error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return '$' + formatNumber(num)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view analytics
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
            {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into the KudoBit ecosystem</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="art">Digital Art</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="games">Games</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Overview Statistics */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalSales)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <Users className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Creators</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.activeCreators)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-4/10 rounded-lg">
                  <Target className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalCustomers)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.averageOrderValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Activity className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trends */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-chart-1">+12.5%</p>
                      <p className="text-sm text-muted-foreground">Revenue Growth</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">+8.3%</p>
                      <p className="text-sm text-muted-foreground">Sales Growth</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-chart-3">+15.7%</p>
                      <p className="text-sm text-muted-foreground">Customer Growth</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {analyticsData.trends.slice(-6).map((trend, index) => {
                      const isLast = index === analyticsData.trends.slice(-6).length - 1
                      const prevTrend = index > 0 ? analyticsData.trends.slice(-6)[index - 1] : null
                      const growth = prevTrend ? ((trend.revenue - prevTrend.revenue) / prevTrend.revenue) * 100 : 0
                      
                      return (
                        <div key={trend.period} className={`flex items-center justify-between p-3 rounded-lg ${isLast ? 'bg-primary/5' : 'bg-muted/30'}`}>
                          <div>
                            <p className="font-medium">{trend.period}</p>
                            <p className="text-sm text-muted-foreground">{formatNumber(trend.sales)} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(trend.revenue)}</p>
                            {prevTrend && (
                              <div className={`flex items-center gap-1 text-sm ${growth >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                                {growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                {Math.abs(growth).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Loyalty Analytics */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Loyalty Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{formatNumber(analyticsData.loyaltyStats.totalBadges)}</p>
                    <p className="text-sm text-muted-foreground">Total Badges Issued</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                        <span className="text-sm">Bronze</span>
                      </div>
                      <span className="font-medium">{formatNumber(analyticsData.loyaltyStats.bronzeBadges)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">Silver</span>
                      </div>
                      <span className="font-medium">{formatNumber(analyticsData.loyaltyStats.silverBadges)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Gold</span>
                      </div>
                      <span className="font-medium">{formatNumber(analyticsData.loyaltyStats.goldBadges)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm">Diamond</span>
                      </div>
                      <span className="font-medium">{formatNumber(analyticsData.loyaltyStats.diamondBadges)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Redemption Rate</span>
                      <span className="font-bold text-chart-1">{analyticsData.loyaltyStats.redemptionRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData && (
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">by {product.creator}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <div className={`flex items-center gap-1 text-sm ${product.growth >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                        {product.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {Math.abs(product.growth).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Creators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData && (
              <div className="space-y-4">
                {analyticsData.topCreators.map((creator, index) => (
                  <div key={creator.address} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-chart-3/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-chart-3">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{creator.displayName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{creator.products} products</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span>⭐ {creator.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(creator.totalRevenue)}</p>
                      <p className="text-sm text-muted-foreground">{formatNumber(creator.totalSales)} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analyticsData.geographicData.map((country, index) => (
                <div key={country.country} className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium">{country.country}</p>
                  <p className="text-2xl font-bold text-primary">{country.percentage}%</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(country.sales)} sales</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(country.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-chart-1" />
                <h4 className="font-medium text-green-800">Growth Opportunity</h4>
              </div>
              <p className="text-sm text-green-700">
                Digital art category showing 23% growth. Consider promoting art creators and launching art-focused campaigns.
              </p>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-blue-800">User Engagement</h4>
              </div>
              <p className="text-sm text-primary">
                Loyalty program showing high engagement. 67% redemption rate indicates strong user retention potential.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-chart-4" />
                <h4 className="font-medium text-orange-800">Market Expansion</h4>
              </div>
              <p className="text-sm text-orange-700">
                Strong performance in US/UK markets. Consider targeted expansion into European and Asian markets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}