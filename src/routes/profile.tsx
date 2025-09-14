import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Camera, 
  Trophy, 
  Star, 
  Heart,
  Package,
  Users,
  Calendar,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react'
import { UserRoleService } from '@/lib/user-roles'
import toast from 'react-hot-toast'

interface UserProfile {
  displayName: string
  bio: string
  profileImage: string
  coverImage: string
  socialLinks: {
    twitter?: string
    discord?: string
    website?: string
  }
  favoriteCreators: string[]
  showcaseNFTs: string[]
  stats: {
    totalSpent: number
    purchaseCount: number
    loyaltyTier: number
    subscriptionsCount: number
    favoritedBy: number
  }
}

interface NFTShowcase {
  id: string
  name: string
  image: string
  collection: string
  description: string
  tokenId: string
  contractAddress: string
}

interface LoyaltyBadge {
  id: number
  name: string
  image: string
  description: string
  earnedAt: number
  count: number
}

function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    profileImage: '',
    coverImage: '',
    socialLinks: {},
    favoriteCreators: [],
    showcaseNFTs: [],
    stats: {
      totalSpent: 0,
      purchaseCount: 0,
      loyaltyTier: 0,
      subscriptionsCount: 0,
      favoritedBy: 0
    }
  })
  const [loyaltyBadges, setLoyaltyBadges] = useState<LoyaltyBadge[]>([])
  const [nftShowcase, setNftShowcase] = useState<NFTShowcase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile()
      loadLoyaltyBadges()
      loadNFTShowcase()
    }
  }, [isConnected, address])

  const loadUserProfile = async () => {
    try {
      // This would integrate with your backend API
      const response = await fetch(`/api/v1/users/${address}/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        // Set default profile for new users
        setProfile(prev => ({
          ...prev,
          displayName: `${address?.slice(0, 6)}...${address?.slice(-4)}` || 'Anonymous'
        }))
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadLoyaltyBadges = async () => {
    try {
      // Mock data - replace with actual contract calls
      const badges: LoyaltyBadge[] = [
        {
          id: 1,
          name: 'Bronze Supporter',
          image: '/badges/bronze-badge.svg',
          description: 'Spent $0.10+ on KudoBit',
          earnedAt: Date.now() - 86400000,
          count: 1
        },
        {
          id: 2,
          name: 'Silver Supporter',
          image: '/badges/silver-badge.svg',
          description: 'Spent $1.00+ on KudoBit',
          earnedAt: Date.now() - 3600000,
          count: 1
        }
      ]
      setLoyaltyBadges(badges)
    } catch (error) {
      console.error('Failed to load loyalty badges:', error)
    }
  }

  const loadNFTShowcase = async () => {
    try {
      // Mock data - replace with actual NFT data from contracts/APIs
      const showcase: NFTShowcase[] = [
        {
          id: '1',
          name: 'Exclusive Wallpaper #001',
          image: 'https://via.placeholder.com/300x300?text=NFT1',
          collection: 'Creator Store',
          description: 'Exclusive digital wallpaper from KudoBit creator',
          tokenId: '1',
          contractAddress: '0x...'
        },
        {
          id: '2',
          name: 'Premium Content Pass',
          image: 'https://via.placeholder.com/300x300?text=NFT2',
          collection: 'Creator Store',
          description: '1-month premium content access',
          tokenId: '2',
          contractAddress: '0x...'
        }
      ]
      setNftShowcase(showcase)
    } catch (error) {
      console.error('Failed to load NFT showcase:', error)
    }
  }

  const saveProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/users/${address}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const getLoyaltyTierName = (tier: number) => {
    switch (tier) {
      case 1: return 'Bronze'
      case 2: return 'Silver'
      case 3: return 'Gold'
      case 4: return 'Diamond'
      default: return 'None'
    }
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

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view and customize your profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Cover Image and Profile Header */}
      <Card className="relative overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {profile.coverImage && (
            <img 
              src={profile.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          {isEditing && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute top-2 right-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Cover
            </Button>
          )}
        </div>
        
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 relative">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.profileImage} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={profile.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Display Name"
                    className="text-xl font-bold"
                  />
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-2 border rounded-md resize-none h-20"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.displayName}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {profile.bio || 'No bio provided'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <Badge className={getLoyaltyTierColor(profile.stats.loyaltyTier)}>
                  <Trophy className="h-3 w-3 mr-1" />
                  {getLoyaltyTierName(profile.stats.loyaltyTier)} Tier
                </Badge>
                <Badge variant="outline">
                  <Package className="h-3 w-3 mr-1" />
                  {profile.stats.purchaseCount} purchases
                </Badge>
                {profile.stats.subscriptionsCount > 0 && (
                  <Badge variant="outline">
                    <Star className="h-3 w-3 mr-1" />
                    {profile.stats.subscriptionsCount} subscriptions
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={saveProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nfts">NFT Collection</TabsTrigger>
          <TabsTrigger value="badges">Loyalty Badges</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(profile.stats.totalSpent / 1000000).toFixed(2)}</div>
                <p className="text-xs text-gray-500">Across all purchases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.stats.purchaseCount}</div>
                <p className="text-xs text-gray-500">Items purchased</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.stats.favoritedBy}</div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Earned Silver Badge</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Purchased Premium Content Pass</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NFT Collection Tab */}
        <TabsContent value="nfts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My NFT Collection</CardTitle>
              <CardDescription>
                Showcase your favorite NFTs from KudoBit and other collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nftShowcase.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nftShowcase.map((nft) => (
                    <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square relative">
                        <img 
                          src={nft.image} 
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm truncate">{nft.name}</h3>
                        <p className="text-xs text-gray-500">{nft.collection}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {nft.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            #{nft.tokenId}
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No NFTs to display</p>
                  <p className="text-xs text-gray-400">Purchase items from creators to build your collection</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Badges</CardTitle>
              <CardDescription>
                Badges earned through your activity on KudoBit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loyaltyBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loyaltyBadges.map((badge) => (
                    <Card key={badge.id} className="text-center p-4">
                      <img 
                        src={badge.image} 
                        alt={badge.name}
                        className="w-16 h-16 mx-auto mb-3"
                      />
                      <h3 className="font-semibold text-sm">{badge.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Qty: {badge.count}</span>
                        <span>{new Date(badge.earnedAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No badges earned yet</p>
                  <p className="text-xs text-gray-400">Make purchases to start earning loyalty badges</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile preferences and social links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={profile.socialLinks.twitter || ''}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="discord">Discord</Label>
                  <Input
                    id="discord"
                    placeholder="username#1234"
                    value={profile.socialLinks.discord || ''}
                    onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yoursite.com"
                    value={profile.socialLinks.website || ''}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Public Profile</p>
                  <p className="text-xs text-gray-500">Allow others to view your profile</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show Purchase Count</p>
                  <p className="text-xs text-gray-500">Display total purchases on profile</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show NFT Collection</p>
                  <p className="text-xs text-gray-500">Display owned NFTs publicly</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})