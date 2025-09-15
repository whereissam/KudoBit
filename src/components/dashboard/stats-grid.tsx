import { DollarSign, Package, Users, Eye, TrendingUp, LucideIcon } from 'lucide-react'

interface Stat {
  label: string
  value: string
  change: string | null
  changeType: 'positive' | 'negative' | null
  icon: LucideIcon
  color: 'green' | 'blue' | 'purple' | 'orange'
}

interface StatsGridProps {
  stats: Stat[]
  loading: boolean
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
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
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
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
      ))}
    </div>
  )
}

export function createStatsFromData(data: {
  totalRevenue: string
  productsSold: string
  activeFans: string
  profileViews: string
}): Stat[] {
  return [
    {
      label: 'Total Revenue',
      value: data.totalRevenue,
      change: null,
      changeType: null,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Products Sold',
      value: data.productsSold,
      change: null,
      changeType: null, 
      icon: Package,
      color: 'blue'
    },
    {
      label: 'Active Fans',
      value: data.activeFans,
      change: null,
      changeType: null,
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Profile Views',
      value: data.profileViews,
      change: null,
      changeType: null,
      icon: Eye,
      color: 'orange'
    }
  ]
}