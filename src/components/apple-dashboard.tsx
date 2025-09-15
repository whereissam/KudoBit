import { useAccount } from 'wagmi'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsGrid, createStatsFromData } from '@/components/dashboard/stats-grid'
import { RecentProducts } from '@/components/dashboard/recent-products'
import { SidebarWidgets } from '@/components/dashboard/sidebar-widgets'

interface AppleDashboardProps {
  creatorProfile?: {
    displayName: string
    bio?: string
    address: string
  }
}

export function AppleDashboard({ creatorProfile }: AppleDashboardProps) {
  const { address } = useAccount()
  const { dashboardStats, loading, error, refetch } = useDashboardData(address)

  const stats = dashboardStats ? createStatsFromData(dashboardStats) : []
  const recentProducts = dashboardStats?.recentProducts || []

  return (
    <div className="bg-muted/30 min-h-screen font-sans tracking-normal">
      <DashboardHeader 
        creatorName={creatorProfile?.displayName || 'Creator'}
        loading={loading}
        error={error}
        onRefresh={refetch}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsGrid stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentProducts products={recentProducts} loading={loading} />
          </div>
          <SidebarWidgets creatorProfile={creatorProfile} />
        </div>
      </div>
    </div>
  )
}