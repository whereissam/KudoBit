import { useState, useEffect } from 'react'
import { AnalyticsService } from '@/lib/analytics-service'

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

export function useDashboardData(address: string | undefined) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (address) {
      loadDashboardData()
    }
  }, [address])

  return {
    dashboardStats,
    loading,
    error,
    refetch: loadDashboardData
  }
}