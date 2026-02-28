import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAffiliate } from '@/hooks/use-affiliate'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Share2, 
  Copy, 
  Crown,
  Gift,
  Star,
  Trophy,
  Target,
  Calendar,
  ExternalLink,
  Check,
  Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AffiliateProfile {
  isAffiliate: boolean
  referralCode: string
  displayName: string
  bio: string
  joinedAt: number
  totalReferrals: number
  totalEarnings: number
  pendingEarnings: number
  currentTier: number
  tierName: string
  isVerified: boolean
  creatorReferrals: number
  buyerReferrals: number
  subscriptionReferrals: number
  totalSalesGenerated: number
}

interface ReferralRecord {
  referee: string
  referralType: 'buyer' | 'creator' | 'purchase' | 'subscription'
  timestamp: number
  purchaseAmount: number
}

interface CommissionTier {
  tierName: string
  minReferrals: number
  purchaseCommission: number
  subscriptionCommission: number
  creatorSignupBonus: number
  buyerSignupBonus: number
}

function AffiliatePage() {
  const { address, isConnected } = useAccount()
  const {
    isAffiliate: hookIsAffiliate,
    profile: hookProfile,
    stats: hookStats,
    topAffiliates: hookTopAffiliates,
    isLoading: loading,
    isWriting,
    isConfirming,
    isSuccess,
    contractDeployed,
    register: hookRegister,
    withdrawCommissions: hookWithdraw,
  } = useAffiliate()

  // Registration form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [copying, setCopying] = useState(false)

  const formatEth = (val: bigint | undefined) => val ? parseFloat(formatUnits(val, 18)).toFixed(4) : '0'

  // Map hook data to the AffiliateProfile shape used by the template
  const profile: AffiliateProfile = {
    isAffiliate: hookIsAffiliate,
    referralCode: hookProfile?.referralCode || '',
    displayName: hookProfile?.displayName || '',
    bio: hookProfile?.bio || '',
    joinedAt: hookProfile?.joinedAt ? hookProfile.joinedAt * 1000 : 0,
    totalReferrals: hookStats?.totalReferrals ?? 0,
    totalEarnings: hookStats?.totalEarnings ? parseFloat(formatUnits(hookStats.totalEarnings, 18)) : 0,
    pendingEarnings: hookStats?.pendingEarnings ? parseFloat(formatUnits(hookStats.pendingEarnings, 18)) : 0,
    currentTier: hookStats?.currentTier ?? 0,
    tierName: hookStats?.tierName ?? 'Bronze Affiliate',
    isVerified: hookProfile?.isVerified ?? false,
    creatorReferrals: hookStats?.creatorReferrals ?? 0,
    buyerReferrals: hookStats?.buyerReferrals ?? 0,
    subscriptionReferrals: hookStats?.subscriptionReferrals ?? 0,
    totalSalesGenerated: hookStats?.totalSalesGenerated ? parseFloat(formatUnits(hookStats.totalSalesGenerated, 18)) : 0,
  }

  // Referrals need event indexer — empty for now
  const referrals: ReferralRecord[] = []

  // Commission tiers are contract-level constants — load from contract or hardcode
  const commissionTiers: CommissionTier[] = [
    { tierName: 'Bronze Affiliate', minReferrals: 0, purchaseCommission: 2, subscriptionCommission: 3, creatorSignupBonus: 0.50, buyerSignupBonus: 0.10 },
    { tierName: 'Silver Affiliate', minReferrals: 10, purchaseCommission: 2.5, subscriptionCommission: 3.5, creatorSignupBonus: 0.75, buyerSignupBonus: 0.15 },
    { tierName: 'Gold Affiliate', minReferrals: 50, purchaseCommission: 3, subscriptionCommission: 4, creatorSignupBonus: 1.00, buyerSignupBonus: 0.20 },
    { tierName: 'Diamond Affiliate', minReferrals: 200, purchaseCommission: 4, subscriptionCommission: 5, creatorSignupBonus: 2.00, buyerSignupBonus: 0.40 },
  ]

  // Build top affiliates from hook data
  const topAffiliates = hookTopAffiliates
    ? hookTopAffiliates.addresses.map((addr, i) => ({
        rank: i + 1,
        displayName: hookTopAffiliates.displayNames[i] || addr.slice(0, 8),
        totalReferrals: hookTopAffiliates.totalReferrals[i] || 0,
        totalEarnings: hookTopAffiliates.totalEarnings[i] ? parseFloat(formatUnits(hookTopAffiliates.totalEarnings[i], 18)) : 0,
      }))
    : []

  const registerAffiliate = () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name')
      return
    }
    hookRegister(displayName, bio)
  }

  const copyReferralLink = async () => {
    const link = `${window.location.origin}?ref=${profile.referralCode}`
    try {
      await navigator.clipboard.writeText(link)
      setCopying(true)
      toast.success('Referral link copied to clipboard!')
      setTimeout(() => setCopying(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const withdrawCommissions = () => {
    hookWithdraw()
  }

  const getReferralTypeColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'bg-primary/10 text-primary'
      case 'creator': return 'bg-chart-3/10 text-chart-3'
      case 'purchase': return 'bg-chart-2/10 text-chart-2'
      case 'subscription': return 'bg-chart-3/10 text-chart-3'
      default: return 'bg-muted/30 text-muted-foreground'
    }
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-chart-5/10 text-chart-5'
      case 2: return 'bg-muted/30 text-muted-foreground'
      case 3: return 'bg-chart-3/10 text-chart-3'
      case 4: return 'bg-primary/10 text-primary'
      default: return 'bg-muted/30 text-muted-foreground'
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access the affiliate program.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted/50 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 bg-muted/50 rounded-lg"></div>
            <div className="h-48 bg-muted/50 rounded-lg"></div>
            <div className="h-48 bg-muted/50 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Affiliate Program</h1>
        <p className="text-muted-foreground">Earn commissions by referring new users to KudoBit</p>
      </div>
      {!profile.isAffiliate ? (
        /* Registration Form */
        (<Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join the Affiliate Program
            </CardTitle>
            <CardDescription>
              Start earning commissions by referring creators and buyers to KudoBit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your affiliate name"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description"
                />
              </div>
            </div>
            
            {/* Commission Structure Preview */}
            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Earning Opportunities:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• Creator signup: $0.50</div>
                <div>• Buyer signup: $0.10</div>
                <div>• Purchase commission: 2%</div>
                <div>• Subscription commission: 3%</div>
              </div>
            </div>
            
            <Button onClick={registerAffiliate} className="w-full" disabled={isWriting || isConfirming}>
              {isWriting ? 'Signing...' : isConfirming ? 'Confirming...' : 'Join Affiliate Program'}
            </Button>
          </CardContent>
        </Card>)
      ) : (
        /* Affiliate Dashboard */
        (<>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{profile.totalReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-2/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">${profile.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-3/10 rounded-lg">
                    <Wallet className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">${profile.pendingEarnings.toFixed(2)}</p>
                    {profile.pendingEarnings >= 1 && (
                      <Button 
                        size="sm" 
                        className="mt-1 h-6 text-xs"
                        onClick={withdrawCommissions}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-3/10 rounded-lg">
                    <Crown className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tier</p>
                    <Badge className={getTierColor(profile.currentTier)}>
                      {profile.tierName}
                    </Badge>
                    {profile.isVerified && (
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="h-3 w-3 text-chart-2" />
                        <span className="text-xs text-chart-2">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}?ref=${profile.referralCode}`}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyReferralLink} disabled={copying}>
                  {copying ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Share this link to earn commissions from new user signups and purchases
              </p>
            </CardContent>
          </Card>
          {/* Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="tiers">Commission Tiers</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Referral Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Referral Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Creator Referrals</span>
                      <Badge variant="outline">{profile.creatorReferrals}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Buyer Referrals</span>
                      <Badge variant="outline">{profile.buyerReferrals}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subscription Referrals</span>
                      <Badge variant="outline">{profile.subscriptionReferrals}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Total Sales Generated</span>
                      <span className="font-bold">${profile.totalSalesGenerated.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Referrals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Referrals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {referrals.slice(0, 5).map((referral, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{referral.referee}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getReferralTypeColor(referral.referralType)}`}>
                                {referral.referralType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(referral.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {referral.purchaseAmount > 0 && (
                            <div className="text-right">
                              <p className="text-sm font-medium">${referral.purchaseAmount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">purchase</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Commission Tiers Tab */}
            <TabsContent value="tiers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {commissionTiers.map((tier, index) => (
                  <Card key={index} className={`${
                    index + 1 === profile.currentTier ? 'border-primary/20 bg-primary/5' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {index + 1 === profile.currentTier && (
                          <Crown className="h-5 w-5 text-chart-3" />
                        )}
                        {tier.tierName}
                      </CardTitle>
                      <CardDescription>
                        {tier.minReferrals === 0 ? 'Entry level' : `${tier.minReferrals}+ referrals`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Purchase commission:</span>
                        <span className="font-medium">{tier.purchaseCommission}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subscription commission:</span>
                        <span className="font-medium">{tier.subscriptionCommission}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Creator signup:</span>
                        <span className="font-medium">${tier.creatorSignupBonus.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Buyer signup:</span>
                        <span className="font-medium">${tier.buyerSignupBonus.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top Affiliates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topAffiliates.map((affiliate, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                        affiliate.displayName === 'You' ? 'bg-primary/5 border border-primary/20' : 'bg-muted/20'
                      }`}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          affiliate.rank === 1 ? 'bg-chart-3 text-white' :
                          affiliate.rank === 2 ? 'bg-muted-foreground text-white' :
                          affiliate.rank === 3 ? 'bg-chart-5 text-white' :
                          'bg-muted/50 text-foreground'
                        }`}>
                          {affiliate.rank <= 3 ? (
                            affiliate.rank === 1 ? '🥇' : affiliate.rank === 2 ? '🥈' : '🥉'
                          ) : (
                            affiliate.rank
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium">
                            {affiliate.displayName}
                            {affiliate.displayName === 'You' && (
                              <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                            )}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold">{affiliate.totalReferrals} referrals</p>
                          <p className="text-sm text-muted-foreground">${affiliate.totalEarnings.toFixed(2)} earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>)
      )}
    </div>
  )
}

export const Route = createFileRoute('/utility/affiliate')({
  component: AffiliatePage,
})