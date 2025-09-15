import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { Plus, TrendingUp, Users } from 'lucide-react'

interface CreatorProfile {
  displayName: string
  address: string
}

interface SidebarWidgetsProps {
  creatorProfile?: CreatorProfile
}

export function SidebarWidgets({ creatorProfile }: SidebarWidgetsProps) {
  const navigate = useNavigate()

  return (
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
  )
}