import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Gift, 
  Search, 
  Filter,
  Star,
  Clock,
  Users,
  Check,
  ExternalLink,
  Award,
  Trophy,
  Crown,
  Sparkles
} from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'
import { getChainById } from '@/lib/wagmi'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/perks/discover')({
  component: PerksDiscoverPage,
})

interface Perk {
  id: number
  creator: string
  name: string
  description: string
  perkType: string
  requiredBadgeId: number
  requiredBadgeContract: string
  minimumBadgeAmount: number
  metadata: string
  isActive: boolean
  usageLimit: number
  timesUsed: number
  expirationTimestamp: number
  redemptionCode: string
}

interface UserBadgeBalance {
  badgeId: number
  balance: number
  tier: string
}

// Placeholder ABI for PerksRegistry contract
const PERKS_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "getAllActivePerks",
    "outputs": [{"internalType": "Perk[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getEligiblePerksForUser",
    "outputs": [{"internalType": "Perk[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "perkId", "type": "uint256"}
    ],
    "name": "checkPerkEligibility",
    "outputs": [
      {"internalType": "bool", "name": "eligible", "type": "bool"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "perkId", "type": "uint256"},
      {"internalType": "string", "name": "additionalData", "type": "string"}
    ],
    "name": "redeemPerk",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

const BADGE_INFO = {
  1: { name: 'Bronze Badge', icon: <Award className="h-4 w-4 text-chart-4" />, color: 'bg-chart-4/10 border-chart-4/20 text-chart-4' },
  2: { name: 'Silver Badge', icon: <Trophy className="h-4 w-4 text-muted-foreground" />, color: 'bg-muted/30 border-border text-foreground' },
  3: { name: 'Gold Badge', icon: <Star className="h-4 w-4 text-chart-1" />, color: 'bg-chart-1/10 border-chart-1/20 text-chart-1' },
  4: { name: 'Diamond Badge', icon: <Crown className="h-4 w-4 text-chart-3" />, color: 'bg-chart-3/10 border-chart-3/20 text-chart-3' }
}

const PERK_TYPE_INFO = {
  'discount': { label: 'Discount', icon: '💰', color: 'bg-chart-1/10 text-chart-1' },
  'exclusive_content': { label: 'Exclusive Content', icon: '🔒', color: 'bg-chart-2/10 text-chart-2' },
  'early_access': { label: 'Early Access', icon: '⚡', color: 'bg-chart-3/10 text-chart-3' },
  'free_product': { label: 'Free Product', icon: '🎁', color: 'bg-chart-4/10 text-chart-4' },
  'collaboration': { label: 'Collaboration', icon: '🤝', color: 'bg-chart-5/10 text-chart-5' },
  'community_access': { label: 'Community', icon: '👥', color: 'bg-primary/10 text-primary' },
  'custom': { label: 'Custom', icon: '✨', color: 'bg-muted/30 text-muted-foreground' }
}

function PerksDiscoverPage() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const { writeContract, isPending } = useWriteContract()
  const chainId = useChainId()
  
  const [perks, setPerks] = useState<Perk[]>([])
  const [userBadges, setUserBadges] = useState<UserBadgeBalance[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [showEligibleOnly, setShowEligibleOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  // Get user's badge balances
  const { data: bronzeBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: [{"inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "uint256", "name": "id", "type": "uint256"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
    functionName: 'balanceOf',
    args: address ? [address, 1n] : undefined,
    chainId,
    account: address,
  })

  const { data: silverBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: [{"inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "uint256", "name": "id", "type": "uint256"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
    functionName: 'balanceOf',
    args: address ? [address, 2n] : undefined,
    chainId,
    account: address,
  })

  const { data: goldBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: [{"inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "uint256", "name": "id", "type": "uint256"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
    functionName: 'balanceOf',
    args: address ? [address, 3n] : undefined,
    chainId,
    account: address,
  })

  const { data: diamondBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: [{"inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "uint256", "name": "id", "type": "uint256"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
    functionName: 'balanceOf',
    args: address ? [address, 4n] : undefined,
    chainId,
    account: address,
  })

  useEffect(() => {
    if (address && bronzeBalance !== undefined && silverBalance !== undefined && goldBalance !== undefined && diamondBalance !== undefined) {
      setUserBadges([
        { badgeId: 1, balance: Number(bronzeBalance), tier: 'Bronze' },
        { badgeId: 2, balance: Number(silverBalance), tier: 'Silver' },
        { badgeId: 3, balance: Number(goldBalance), tier: 'Gold' },
        { badgeId: 4, balance: Number(diamondBalance), tier: 'Diamond' }
      ])
    }
  }, [address, bronzeBalance, silverBalance, goldBalance, diamondBalance])

  useEffect(() => {
    loadPerks()
  }, [address])

  const loadPerks = async () => {
    try {
      setLoading(true)
      // In a real implementation, this would fetch from the PerksRegistry contract
      // For now, we'll use mock data to demonstrate the concept
      const mockPerks: Perk[] = [
        {
          id: 1,
          creator: '0x1234...5678',
          name: '20% Discount on All Digital Art',
          description: 'Enjoy a 20% discount on all my digital art pieces. Perfect for collectors looking to expand their portfolio!',
          perkType: 'discount',
          requiredBadgeId: 2,
          requiredBadgeContract: CONTRACTS.loyaltyToken,
          minimumBadgeAmount: 1,
          metadata: '{"code": "ART20OFF"}',
          isActive: true,
          usageLimit: 100,
          timesUsed: 23,
          expirationTimestamp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          redemptionCode: 'ART20OFF'
        },
        {
          id: 2,
          creator: '0x2345...6789',
          name: 'Exclusive Music Album Preview',
          description: 'Get early access to my upcoming album "Blockchain Symphony" - 3 days before public release!',
          perkType: 'early_access',
          requiredBadgeId: 3,
          requiredBadgeContract: CONTRACTS.loyaltyToken,
          minimumBadgeAmount: 1,
          metadata: '{"album": "Blockchain Symphony"}',
          isActive: true,
          usageLimit: 50,
          timesUsed: 12,
          expirationTimestamp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
          redemptionCode: 'SYMPHONY2024'
        },
        {
          id: 3,
          creator: '0x3456...7890',
          name: 'Free Web3 Development Guide',
          description: 'Comprehensive 100-page guide to Web3 development, including smart contracts, DApps, and best practices.',
          perkType: 'free_product',
          requiredBadgeId: 1,
          requiredBadgeContract: CONTRACTS.loyaltyToken,
          minimumBadgeAmount: 1,
          metadata: '{"product": "Web3 Dev Guide"}',
          isActive: true,
          usageLimit: 0,
          timesUsed: 89,
          expirationTimestamp: 0, // Never expires
          redemptionCode: 'WEB3GUIDE'
        },
        {
          id: 4,
          creator: '0x4567...8901',
          name: 'VIP Community Discord Access',
          description: 'Join my exclusive Discord community for creators. Network, collaborate, and get insider tips!',
          perkType: 'community_access',
          requiredBadgeId: 4,
          requiredBadgeContract: CONTRACTS.loyaltyToken,
          minimumBadgeAmount: 1,
          metadata: '{"discord": "vip-creators"}',
          isActive: true,
          usageLimit: 25,
          timesUsed: 8,
          expirationTimestamp: 0,
          redemptionCode: 'VIPCREATOR'
        }
      ]

      setPerks(mockPerks)
    } catch (error) {
      console.error('Error loading perks:', error)
      toast.error('Failed to load perks')
    } finally {
      setLoading(false)
    }
  }

  const checkEligibility = (perk: Perk): boolean => {
    if (!address || !userBadges.length) return false
    
    const requiredBadge = userBadges.find(b => b.badgeId === perk.requiredBadgeId)
    return requiredBadge ? requiredBadge.balance >= perk.minimumBadgeAmount : false
  }

  const handleRedeemPerk = async (perk: Perk) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return
    }

    if (!checkEligibility(perk)) {
      toast.error('You are not eligible for this perk')
      return
    }

    try {
      // Note: This would need the actual deployed PerksRegistry contract address
      const perksRegistryAddress = '0x0000000000000000000000000000000000000000' // Placeholder

      await writeContract({
        address: perksRegistryAddress,
        abi: PERKS_REGISTRY_ABI,
        functionName: 'redeemPerk',
        chain: getChainById(chainId),
        account: address,
        args: [BigInt(perk.id), '']
      })

      toast.success(`Perk redeemed! Code: ${perk.redemptionCode}`)
      
      // In a real app, you would update the perk's usage count
      setPerks(prev => prev.map(p => 
        p.id === perk.id 
          ? { ...p, timesUsed: p.timesUsed + 1 }
          : p
      ))
    } catch (error) {
      console.error('Error redeeming perk:', error)
      toast.error('Failed to redeem perk')
    }
  }

  const filteredPerks = perks.filter(perk => {
    const matchesSearch = perk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         perk.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || perk.perkType === filterType
    const matchesTier = filterTier === 'all' || perk.requiredBadgeId.toString() === filterTier
    const isEligible = !showEligibleOnly || checkEligibility(perk)
    
    return matchesSearch && matchesType && matchesTier && isEligible
  })

  const getTimeRemaining = (timestamp: number): string => {
    if (timestamp === 0) return 'Never expires'
    
    const now = Math.floor(Date.now() / 1000)
    const remaining = timestamp - now
    
    if (remaining <= 0) return 'Expired'
    
    const days = Math.floor(remaining / (24 * 60 * 60))
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
    
    if (days > 0) return `${days} days remaining`
    return `${hours} hours remaining`
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Gift className="h-5 w-5" />
              Discover Cross-Creator Perks
            </CardTitle>
            <CardDescription>
              Connect your wallet to see available perks for your loyalty badges
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Cross-Creator Perks
        </h1>
        <p className="text-muted-foreground">
          Discover exclusive perks from creators across the KudoBit ecosystem. Your loyalty badges unlock special benefits!
        </p>
      </div>

      {/* User Badge Summary */}
      {userBadges.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Your Loyalty Badges</CardTitle>
            <CardDescription>Use these badges to unlock exclusive perks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {userBadges.filter(badge => badge.balance > 0).map(badge => (
                <Badge key={badge.badgeId} className={BADGE_INFO[badge.badgeId as keyof typeof BADGE_INFO]?.color}>
                  {BADGE_INFO[badge.badgeId as keyof typeof BADGE_INFO]?.icon}
                  <span className="ml-1">{badge.tier}: {badge.balance}</span>
                </Badge>
              ))}
              {userBadges.every(badge => badge.balance === 0) && (
                <p className="text-muted-foreground text-sm">
                  No badges yet. Make purchases to earn loyalty badges and unlock perks!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Perks</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search perks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Perk Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(PERK_TYPE_INFO).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.icon} {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Required Badge</label>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {Object.entries(BADGE_INFO).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.icon} {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="eligibleOnly"
                checked={showEligibleOnly}
                onChange={(e) => setShowEligibleOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="eligibleOnly" className="text-sm font-medium">
                Show eligible only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPerks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No perks found</h3>
            <p className="text-muted-foreground">
              {showEligibleOnly 
                ? "You don't have the required badges for available perks. Keep supporting creators to earn more badges!"
                : "Try adjusting your search or filters to find perks."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPerks.map((perk) => {
            const isEligible = checkEligibility(perk)
            const perkTypeInfo = PERK_TYPE_INFO[perk.perkType as keyof typeof PERK_TYPE_INFO]
            const badgeInfo = BADGE_INFO[perk.requiredBadgeId as keyof typeof BADGE_INFO]
            const timeRemaining = getTimeRemaining(perk.expirationTimestamp)
            const isExpired = perk.expirationTimestamp > 0 && perk.expirationTimestamp <= Math.floor(Date.now() / 1000)
            const isUsageExhausted = perk.usageLimit > 0 && perk.timesUsed >= perk.usageLimit

            return (
              <Card key={perk.id} className={`transition-all duration-200 ${isEligible ? 'hover:shadow-lg border-primary/20' : 'opacity-60'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{perk.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${perkTypeInfo?.color || 'bg-gray-50 text-gray-700'}`}>
                          {perkTypeInfo?.icon} {perkTypeInfo?.label}
                        </Badge>
                        <Badge className={`text-xs ${badgeInfo?.color}`}>
                          {badgeInfo?.icon}
                          <span className="ml-1">Requires {badgeInfo?.name}</span>
                        </Badge>
                      </div>
                    </div>
                    {isEligible && <Check className="h-5 w-5 text-green-500 flex-shrink-0" />}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {perk.description}
                  </CardDescription>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeRemaining}
                      </span>
                      {perk.usageLimit > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {perk.timesUsed}/{perk.usageLimit} used
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs">
                      By {perk.creator.slice(0, 6)}...{perk.creator.slice(-4)}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRedeemPerk(perk)}
                    disabled={!isEligible || isPending || isExpired || isUsageExhausted}
                    className="w-full"
                    variant={isEligible ? 'default' : 'outline'}
                  >
                    {isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redeeming...
                      </>
                    ) : isExpired ? (
                      'Expired'
                    ) : isUsageExhausted ? (
                      'Fully Redeemed'
                    ) : !isEligible ? (
                      'Insufficient Badges'
                    ) : (
                      <>
                        <Gift className="mr-2 h-4 w-4" />
                        Redeem Perk
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Call to Action */}
      <Card className="mt-8 bg-gradient-to-r from-primary/5 to-chart-3/5 border border-primary/10">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Want to Create Your Own Perks?</h3>
          <p className="text-muted-foreground mb-4">
            Attract badge holders from across the KudoBit ecosystem by offering exclusive perks for their loyalty badges.
          </p>
          <Button onClick={() => navigate({ to: '/creator/create-perk' })}>
            <Gift className="mr-2 h-4 w-4" />
            Create Cross-Creator Perk
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}