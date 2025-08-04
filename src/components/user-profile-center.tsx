import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  LogOut, 
  ShoppingCart, 
  Package, 
  Plus,
  ChevronDown,
  Wallet,
  Crown
} from 'lucide-react'
import { UserRoleService, UserRole } from '@/lib/user-roles'
import { useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'

export function UserProfileCenter() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()
  
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      const profile = UserRoleService.getCreatorProfile()
      if (profile) {
        setUserRole(UserRole.CREATOR)
        setCreatorProfile(profile)
      } else {
        setUserRole(UserRole.BUYER)
        setCreatorProfile(null)
      }
    } else {
      setUserRole(null)
      setCreatorProfile(null)
    }
  }, [isConnected, address])

  const handleDisconnect = () => {
    disconnect()
    UserRoleService.logout()
    setUserRole(null)
    setCreatorProfile(null)
    toast.success('Disconnected from wallet')
    setIsOpen(false)
  }

  const handleBecomeCreator = () => {
    navigate({ to: '/register' })
    setIsOpen(false)
  }

  const handleViewProfile = () => {
    if (userRole === UserRole.CREATOR) {
      navigate({ to: '/creator/profile' })
    }
    setIsOpen(false)
  }

  const handleGoToDashboard = () => {
    if (userRole === UserRole.CREATOR) {
      navigate({ to: '/creator/dashboard' })
    }
    setIsOpen(false)
  }

  if (!isConnected || !address) {
    return null // WalletConnect component handles this case
  }

  const displayName = creatorProfile?.displayName || `${address.slice(0, 6)}...${address.slice(-4)}`
  const isCreator = userRole === UserRole.CREATOR

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-auto px-2 rounded-full">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {isCreator ? '🎨' : '👤'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">{displayName}</span>
              <div className="flex items-center gap-1">
                <Badge variant={isCreator ? 'default' : 'secondary'} className="text-xs px-1 py-0 h-4">
                  {isCreator ? 'Creator' : 'Buyer'}
                </Badge>
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {isCreator ? '🎨' : '👤'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {address.slice(0, 12)}...{address.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isCreator ? 'default' : 'secondary'} className="text-xs">
                {isCreator ? (
                  <><Crown className="h-3 w-3 mr-1" /> Creator</>
                ) : (
                  <><User className="h-3 w-3 mr-1" /> Buyer</>
                )}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wallet className="h-3 w-3" />
                Connected
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Creator Actions */}
        {isCreator && (
          <>
            <DropdownMenuItem onClick={handleGoToDashboard}>
              <Package className="mr-2 h-4 w-4" />
              Creator Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: '/creator/create-product' })}>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewProfile}>
              <Settings className="mr-2 h-4 w-4" />
              Creator Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Buyer Actions */}
        <DropdownMenuItem onClick={() => navigate({ to: '/purchases' })}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          My Purchases
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate({ to: '/loyalty' })}>
          <Crown className="mr-2 h-4 w-4" />
          My Loyalty Badges
        </DropdownMenuItem>
        
        {/* Become Creator Option for Buyers */}
        {!isCreator && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBecomeCreator} className="text-primary">
              <Plus className="mr-2 h-4 w-4" />
              Become a Creator
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Account Actions */}
        <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}