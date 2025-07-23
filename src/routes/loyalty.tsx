import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Trophy, Star, Crown } from 'lucide-react'
import { useReadContract, useAccount } from 'wagmi'
import { CONTRACTS, LOYALTY_TOKEN_ABI } from '@/lib/contracts'
import { PurchaseHistory } from '@/components/purchase-history'

export const Route = createFileRoute('/loyalty')({
  component: LoyaltyDashboard,
})

function LoyaltyDashboard() {
  const { address } = useAccount()

  // Badge IDs from the contract
  const BRONZE_BADGE = 1
  const SILVER_BADGE = 2  
  const GOLD_BADGE = 3
  const DIAMOND_BADGE = 4

  // Get user's badge balances
  const { data: bronzeBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, BigInt(BRONZE_BADGE)] : undefined,
  })

  const { data: silverBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, BigInt(SILVER_BADGE)] : undefined,
  })

  const { data: goldBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, BigInt(GOLD_BADGE)] : undefined,
  })

  const { data: diamondBalance } = useReadContract({
    address: CONTRACTS.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, BigInt(DIAMOND_BADGE)] : undefined,
  })

  const badges = [
    {
      id: BRONZE_BADGE,
      name: 'Bronze Badge',
      description: 'Awarded for your first purchases',
      icon: Award,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      balance: bronzeBalance ? Number(bronzeBalance) : 0,
    },
    {
      id: SILVER_BADGE,
      name: 'Silver Badge', 
      description: 'Earned through premium purchases',
      icon: Trophy,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      balance: silverBalance ? Number(silverBalance) : 0,
    },
    {
      id: GOLD_BADGE,
      name: 'Gold Badge',
      description: 'For loyal customers',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      balance: goldBalance ? Number(goldBalance) : 0,
    },
    {
      id: DIAMOND_BADGE,
      name: 'Diamond Badge',
      description: 'Ultimate loyalty achievement',
      icon: Crown,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      balance: diamondBalance ? Number(diamondBalance) : 0,
    },
  ]

  const totalBadges = badges.reduce((sum, badge) => sum + badge.balance, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            My Loyalty Dashboard
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            View your earned loyalty badges and track your rewards on Morph Commerce.
          </p>
          
          {address && (
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="bg-card rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Total Badges:</span>
                  <span className="text-lg sm:text-xl font-bold">{totalBadges}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!address ? (
          <div className="text-center p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Connect Your Wallet</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Connect your wallet to view your loyalty badges and rewards
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <Card key={badge.id} className="text-center">
                  <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                    <div className="flex justify-center mb-2 sm:mb-4">
                      <div className={`p-2 sm:p-3 lg:p-4 rounded-full ${badge.color}`}>
                        <Icon className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                      </div>
                    </div>
                    <CardTitle className="text-sm sm:text-base lg:text-lg">{badge.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm hidden sm:block">{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{badge.balance}</div>
                      <Badge 
                        variant={badge.balance > 0 ? 'default' : 'secondary'}
                        className="text-xs px-2 py-1"
                      >
                        {badge.balance > 0 ? 'Owned' : 'Not Earned'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {address && totalBadges === 0 && (
          <div className="text-center mt-8 sm:mt-12 p-6 sm:p-8 bg-card rounded-lg">
            <Award className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Badges Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">
              Start shopping to earn your first loyalty badges!
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              Each purchase rewards you with a badge based on the item's value and tier.
            </p>
          </div>
        )}

        {/* Purchase History Section */}
        {address && (
          <div className="mt-8 sm:mt-12">
            <PurchaseHistory />
          </div>
        )}
      </div>
    </div>
  )
}