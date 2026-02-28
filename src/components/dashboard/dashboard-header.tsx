import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { Plus, TrendingUp, Settings, Loader2 } from 'lucide-react'

interface DashboardHeaderProps {
  creatorName: string
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function DashboardHeader({ creatorName, loading, error, onRefresh }: DashboardHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {creatorName}
            </h1>
            <p className="text-muted-foreground mt-2">
              {loading ? 'Loading your dashboard...' : error ? 'Error loading data - showing cached data' : "Here's what's happening with your products today."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="border-border hover:border-border/80 text-foreground"
              onClick={() => navigate({ to: '/creator/profile' })}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              className="border-border hover:border-border/80 text-foreground"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button 
              variant="outline"
              className="border-border hover:border-border/80 text-foreground"
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
  )
}