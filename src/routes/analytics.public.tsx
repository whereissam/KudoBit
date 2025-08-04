import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Crown,
  Trophy,
  Star,
  Target,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Globe
} from 'lucide-react'

interface PlatformStats {
  totalUsers: number
  totalCreators: number
  verifiedCreators: number
  totalProducts: number
  totalSales: number
  totalVolume: number
  activeSubscriptions: number
  totalBadgesIssued: number
  averageTransactionSize: number
  monthlyActiveUsers: number
  platformRevenue: number
  totalAffiliates: number
}

interface TopCreator {
  rank: number
  name: string
  address: string
  totalSales: number
  totalRevenue: number
  products: number
  isVerified: boolean
  loyaltyTier: number
}

interface CategoryStats {
  category: string
  totalSales: number
  totalProducts: number
  averagePrice: number
  topCreator: string
}

interface TimeSeriesData {
  date: string
  users: number
  sales: number
  volume: number
}

function PublicAnalyticsPage() {
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalCreators: 0,
    verifiedCreators: 0,
    totalProducts: 0,
    totalSales: 0,
    totalVolume: 0,
    activeSubscriptions: 0,
    totalBadgesIssued: 0,
    averageTransactionSize: 0,
    monthlyActiveUsers: 0,
    platformRevenue: 0,
    totalAffiliates: 0
  })
  
  const [topCreators, setTopCreators] = useState<TopCreator[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlatformStats()
    loadTopCreators()
    loadCategoryStats()
    loadTimeSeriesData()
  }, [])

  const loadPlatformStats = async () => {
    try {
      // Mock data - replace with actual API calls
      const stats: PlatformStats = {
        totalUsers: 12847,
        totalCreators: 1653,
        verifiedCreators: 234,
        totalProducts: 8392,
        totalSales: 45672,
        totalVolume: 189423.67,
        activeSubscriptions: 3521,
        totalBadgesIssued: 23847,
        averageTransactionSize: 4.15,
        monthlyActiveUsers: 8934,
        platformRevenue: 9471.18,
        totalAffiliates: 456
      }
      setPlatformStats(stats)
    } catch (error) {
      console.error('Failed to load platform stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTopCreators = async () => {
    try {
      // Mock data - replace with API calls
      const creators: TopCreator[] = [
        {
          rank: 1,
          name: 'DigitalArtMaster',
          address: '0x1234...5678',
          totalSales: 2543,
          totalRevenue: 15678.90,
          products: 89,
          isVerified: true,
          loyaltyTier: 4
        },
        {
          rank: 2,
          name: 'CryptoCreator',
          address: '0x2345...6789',
          totalSales: 1987,
          totalRevenue: 12345.67,
          products: 67,
          isVerified: true,
          loyaltyTier: 4
        },
        {
          rank: 3,
          name: 'NFTArtist',
          address: '0x3456...7890',
          totalSales: 1654,
          totalRevenue: 9876.54,
          products: 45,
          isVerified: false,
          loyaltyTier: 3
        },
        {
          rank: 4,
          name: 'WebDesigner',
          address: '0x4567...8901',
          totalSales: 1432,
          totalRevenue: 7654.32,
          products: 78,
          isVerified: true,
          loyaltyTier: 3
        },
        {
          rank: 5,
          name: 'MusicProducer',
          address: '0x5678...9012',
          totalSales: 1298,
          totalRevenue: 6543.21,
          products: 34,
          isVerified: false,
          loyaltyTier: 2
        }
      ]
      setTopCreators(creators)
    } catch (error) {
      console.error('Failed to load top creators:', error)
    }
  }

  const loadCategoryStats = async () => {
    try {
      // Mock data - replace with API calls
      const categories: CategoryStats[] = [
        {
          category: 'Digital Art',
          totalSales: 15674,
          totalProducts: 3421,
          averagePrice: 8.45,
          topCreator: 'DigitalArtMaster'
        },
        {
          category: 'Music & Audio',
          totalSales: 9823,
          totalProducts: 1987,
          averagePrice: 3.67,
          topCreator: 'MusicProducer'
        },
        {
          category: 'Templates & Designs',
          totalSales: 7654,
          totalProducts: 2134,
          averagePrice: 2.45,
          topCreator: 'WebDesigner'
        },
        {
          category: 'Educational Content',
          totalSales: 5432,
          totalProducts: 876,
          averagePrice: 12.34,
          topCreator: 'TechEducator'
        },
        {
          category: 'Photography',
          totalSales: 4321,
          totalProducts: 1543,
          averagePrice: 1.89,
          topCreator: 'PhotoPro'
        }
      ]
      setCategoryStats(categories)
    } catch (error) {
      console.error('Failed to load category stats:', error)
    }
  }

  const loadTimeSeriesData = async () => {
    try {
      // Mock data - replace with API calls
      const data: TimeSeriesData[] = []
      const today = new Date()
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        data.push({
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 200) + 150,
          sales: Math.floor(Math.random() * 50) + 25,
          volume: Math.random() * 1000 + 500
        })
      }
      
      setTimeSeriesData(data)
    } catch (error) {
      console.error('Failed to load time series data:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getLoyaltyTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-orange-100 text-orange-800'
      case 2: return 'bg-gray-100 text-gray-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const getTierName = (tier: number) => {
    switch (tier) {
      case 1: return 'Bronze'
      case 2: return 'Silver'
      case 3: return 'Gold'
      case 4: return 'Diamond'
      default: return 'None'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
        <p className="text-gray-600">Real-time insights into KudoBit's ecosystem and growth</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(platformStats.totalUsers)}</p>
                <p className="text-xs text-green-600">+12% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Creators</p>
                <p className="text-2xl font-bold">{formatNumber(platformStats.totalCreators)}</p>
                <p className="text-xs text-gray-500">
                  {platformStats.verifiedCreators} verified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">${formatNumber(platformStats.totalVolume)}</p>
                <p className="text-xs text-green-600">+8.5% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold">{formatNumber(platformStats.totalProducts)}</p>
                <p className="text-xs text-blue-600">+15% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-xl font-bold">{formatNumber(platformStats.totalSales)}</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-xl font-bold">${platformStats.averageTransactionSize.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-xl font-bold">{formatNumber(platformStats.activeSubscriptions)}</p>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="creators" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="creators">Top Creators</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
        </TabsList>

        {/* Top Creators Tab */}
        <TabsContent value="creators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Performing Creators
              </CardTitle>
              <CardDescription>
                Creators ranked by total sales volume and community impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCreators.map((creator) => (
                  <div key={creator.rank} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      creator.rank === 1 ? 'bg-yellow-400 text-white' :
                      creator.rank === 2 ? 'bg-gray-400 text-white' :
                      creator.rank === 3 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {creator.rank <= 3 ? (
                        creator.rank === 1 ? '🥇' : creator.rank === 2 ? '🥈' : '🥉'
                      ) : (
                        creator.rank
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{creator.name}</h3>
                        {creator.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getLoyaltyTierColor(creator.loyaltyTier)}`}>
                          {getTierName(creator.loyaltyTier)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{creator.address}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">${creator.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {creator.totalSales.toLocaleString()} sales • {creator.products} products
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Performance
              </CardTitle>
              <CardDescription>
                Sales performance across different product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((category, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{category.category}</h3>
                      <Badge variant="outline">{category.totalSales.toLocaleString()} sales</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Products</p>
                        <p className="font-semibold">{category.totalProducts.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Price</p>
                        <p className="font-semibold">${category.averagePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Top Creator</p>
                        <p className="font-semibold">{category.topCreator}</p>
                      </div>
                    </div>
                    
                    {/* Visual representation of category size */}
                    <div className="mt-3">
                      <Progress 
                        value={(category.totalSales / Math.max(...categoryStats.map(c => c.totalSales))) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Daily Active Users (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-1">
                  {timeSeriesData.slice(-30).map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div 
                        className="bg-blue-500 w-3 rounded-t"
                        style={{ 
                          height: `${(data.users / Math.max(...timeSeriesData.map(d => d.users))) * 200}px`
                        }}
                      ></div>
                      {index % 5 === 0 && (
                        <span className="text-xs text-gray-500 transform -rotate-45">
                          {new Date(data.date).getDate()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Volume (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-1">
                  {timeSeriesData.slice(-30).map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div 
                        className="bg-green-500 w-3 rounded-t"
                        style={{ 
                          height: `${(data.volume / Math.max(...timeSeriesData.map(d => d.volume))) * 200}px`
                        }}
                      ></div>
                      {index % 5 === 0 && (
                        <span className="text-xs text-gray-500 transform -rotate-45">
                          {new Date(data.date).getDate()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">+12%</p>
                  <p className="text-sm text-gray-600">User Growth (30d)</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+8.5%</p>
                  <p className="text-sm text-gray-600">Volume Growth (30d)</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">+15%</p>
                  <p className="text-sm text-gray-600">Products Added (30d)</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">+23%</p>
                  <p className="text-sm text-gray-600">Creator Signups (30d)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ecosystem Tab */}
        <TabsContent value="ecosystem" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Loyalty Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Badges Issued</span>
                  <span className="font-bold">{formatNumber(platformStats.totalBadgesIssued)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Bronze Badges</span>
                    <span>12,543</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Silver Badges</span>
                    <span>6,789</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Gold Badges</span>
                    <span>3,456</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Diamond Badges</span>
                    <span>1,059</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Programs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active Affiliates</span>
                  <span className="font-bold">{platformStats.totalAffiliates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Community Posts</span>
                  <span className="font-bold">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Quests</span>
                  <span className="font-bold">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Achievements Unlocked</span>
                  <span className="font-bold">8,923</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1.2s</div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-xs text-gray-500">Global average</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">$9,471</div>
                  <p className="text-sm text-gray-600">Platform Revenue</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/analytics/public')({
  component: PublicAnalyticsPage,
})