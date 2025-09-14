import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
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
  const [profile, setProfile] = useState<AffiliateProfile>({
    isAffiliate: false,
    referralCode: '',
    displayName: '',
    bio: '',
    joinedAt: 0,
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    currentTier: 1,
    tierName: 'Bronze Affiliate',
    isVerified: false,
    creatorReferrals: 0,
    buyerReferrals: 0,
    subscriptionReferrals: 0,
    totalSalesGenerated: 0
  })
  const [referrals, setReferrals] = useState<ReferralRecord[]>([])
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([])
  const [topAffiliates, setTopAffiliates] = useState<any[]>([])
  
  // Registration form
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      loadAffiliateProfile()
      loadCommissionTiers()
      loadTopAffiliates()
    }
  }, [isConnected, address])

  const loadAffiliateProfile = async () => {
    try {
      // Mock data - replace with contract calls
      const mockProfile: AffiliateProfile = {
        isAffiliate: true,
        referralCode: 'KUDOBIT_CRYPTO123',
        displayName: 'CryptoAffiliate',
        bio: 'Helping people discover the best Web3 creator marketplace!',
        joinedAt: Date.now() - 2592000000, // 30 days ago
        totalReferrals: 15,
        totalEarnings: 23.45,
        pendingEarnings: 5.67,
        currentTier: 2,
        tierName: 'Silver Affiliate',
        isVerified: true,
        creatorReferrals: 3,
        buyerReferrals: 12,
        subscriptionReferrals: 8,
        totalSalesGenerated: 156.78
      }
      setProfile(mockProfile)
      
      if (mockProfile.isAffiliate) {
        loadReferrals()
      }
    } catch (error) {
      console.error('Failed to load affiliate profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReferrals = async () => {
    try {
      // Mock data - replace with contract calls
      const mockReferrals: ReferralRecord[] = [
        {
          referee: '0x1234...5678',
          referralType: 'buyer',
          timestamp: Date.now() - 86400000,
          purchaseAmount: 0
        },
        {
          referee: '0x2345...6789',
          referralType: 'purchase',
          timestamp: Date.now() - 172800000,
          purchaseAmount: 15.50
        },
        {
          referee: '0x3456...7890',
          referralType: 'creator',
          timestamp: Date.now() - 259200000,
          purchaseAmount: 0
        },
        {
          referee: '0x4567...8901',
          referralType: 'subscription',
          timestamp: Date.now() - 345600000,
          purchaseAmount: 5.00
        }
      ]
      setReferrals(mockReferrals)
    } catch (error) {
      console.error('Failed to load referrals:', error)
    }
  }

  const loadCommissionTiers = async () => {
    try {
      // Mock data - replace with contract calls
      const tiers: CommissionTier[] = [
        {
          tierName: 'Bronze Affiliate',
          minReferrals: 0,
          purchaseCommission: 2,
          subscriptionCommission: 3,
          creatorSignupBonus: 0.50,
          buyerSignupBonus: 0.10
        },
        {
          tierName: 'Silver Affiliate',
          minReferrals: 10,
          purchaseCommission: 2.5,
          subscriptionCommission: 3.5,
          creatorSignupBonus: 0.75,
          buyerSignupBonus: 0.15
        },
        {
          tierName: 'Gold Affiliate',
          minReferrals: 50,
          purchaseCommission: 3,
          subscriptionCommission: 4,
          creatorSignupBonus: 1.00,
          buyerSignupBonus: 0.20
        },
        {
          tierName: 'Diamond Affiliate',
          minReferrals: 200,
          purchaseCommission: 4,
          subscriptionCommission: 5,
          creatorSignupBonus: 2.00,
          buyerSignupBonus: 0.40
        }
      ]
      setCommissionTiers(tiers)
    } catch (error) {
      console.error('Failed to load commission tiers:', error)
    }
  }

  const loadTopAffiliates = async () => {
    try {
      // Mock data - replace with API calls
      const top = [
        { rank: 1, displayName: 'TopAffiliate1', totalReferrals: 456, totalEarnings: 1234.56 },
        { rank: 2, displayName: 'SuperReferrer', totalReferrals: 234, totalEarnings: 890.12 },
        { rank: 3, displayName: 'CryptoInfluencer', totalReferrals: 189, totalEarnings: 567.89 },
        { rank: 4, displayName: 'You', totalReferrals: 15, totalEarnings: 23.45 },
      ]
      setTopAffiliates(top)
    } catch (error) {
      console.error('Failed to load top affiliates:', error)
    }
  }

  const registerAffiliate = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter a display name')
      return
    }

    try {
      setLoading(true)
      // Mock registration - replace with contract call
      const newCode = `KUDOBIT_${displayName.toUpperCase().replace(/[^A-Z0-9]/g, '')}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      setProfile(prev => ({
        ...prev,
        isAffiliate: true,
        referralCode: newCode,
        displayName,
        bio,
        joinedAt: Date.now(),
        currentTier: 1,
        tierName: 'Bronze Affiliate'
      }))
      
      toast.success('Successfully registered as affiliate!')
    } catch (error) {
      console.error('Failed to register affiliate:', error)
      toast.error('Failed to register as affiliate')
    } finally {
      setLoading(false)
    }
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

  const withdrawCommissions = async () => {
    if (profile.pendingEarnings < 1) {
      toast.error('Minimum withdrawal is $1.00')
      return
    }

    try {
      setLoading(true)
      // Mock withdrawal - replace with contract call
      toast.success(`Withdrew $${profile.pendingEarnings.toFixed(2)} to your wallet`)
      
      setProfile(prev => ({
        ...prev,
        pendingEarnings: 0
      }))
    } catch (error) {
      console.error('Failed to withdraw commissions:', error)
      toast.error('Failed to withdraw commissions')
    } finally {
      setLoading(false)
    }
  }

  const getReferralTypeColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'bg-blue-100 text-blue-800'
      case 'creator': return 'bg-purple-100 text-purple-800'
      case 'purchase': return 'bg-green-100 text-green-800'
      case 'subscription': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-orange-100 text-orange-800'
      case 2: return 'bg-gray-100 text-gray-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-500'
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
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Program</h1>
        <p className="text-gray-600">Earn commissions by referring new users to KudoBit</p>
      </div>

      {!profile.isAffiliate ? (
        /* Registration Form */
        <Card className="max-w-2xl mx-auto">
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Earning Opportunities:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• Creator signup: $0.50</div>
                <div>• Buyer signup: $0.10</div>
                <div>• Purchase commission: 2%</div>
                <div>• Subscription commission: 3%</div>
              </div>
            </div>
            
            <Button onClick={registerAffiliate} className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Join Affiliate Program'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Affiliate Dashboard */
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold">{profile.totalReferrals}</p>
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
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">${profile.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
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
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Crown className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tier</p>
                    <Badge className={getTierColor(profile.currentTier)}>
                      {profile.tierName}
                    </Badge>
                    {profile.isVerified && (
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500">Verified</span>
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
              <p className="text-sm text-gray-500 mt-2">
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
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{referral.referee}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getReferralTypeColor(referral.referralType)}`}>
                                {referral.referralType}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(referral.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {referral.purchaseAmount > 0 && (
                            <div className="text-right">
                              <p className="text-sm font-medium">${referral.purchaseAmount.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">purchase</p>
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
                    index + 1 === profile.currentTier ? 'border-blue-200 bg-blue-50' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {index + 1 === profile.currentTier && (
                          <Crown className="h-5 w-5 text-yellow-500" />
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
                        affiliate.displayName === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          affiliate.rank === 1 ? 'bg-yellow-400 text-white' :
                          affiliate.rank === 2 ? 'bg-gray-400 text-white' :
                          affiliate.rank === 3 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-700'
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
                          <p className="text-sm text-gray-500">${affiliate.totalEarnings.toFixed(2)} earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export const Route = createFileRoute('/affiliate')({
  component: AffiliatePage,
})