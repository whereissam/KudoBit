import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Trophy, Star, Crown, Loader2, ExternalLink } from 'lucide-react'
import { useReadContract, useAccount, useChainId } from 'wagmi'
import { CONTRACTS, getContracts, LOYALTY_TOKEN_ABI } from '@/lib/contracts'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/loyalty')({
  component: LoyaltyDashboard,
})

function LoyaltyDashboard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const navigate = useNavigate()
  const [badges, setBadges] = useState<Array<{ id: number, balance: bigint, name: string, icon: React.ReactNode, color: string, description: string }>>([])
  const [loading, setLoading] = useState(true)
  
  // Get contracts for current chain
  const currentContracts = useMemo(() => getContracts(chainId), [chainId])

  // Badge definitions
  const badgeTypes = [
    {
      id: 1,
      name: 'Bronze Badge',
      icon: <Award className="h-6 w-6 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      description: 'Awarded for your first purchase or small transactions'
    },
    {
      id: 2,
      name: 'Silver Badge',
      icon: <Trophy className="h-6 w-6 text-muted-foreground" />,
      color: 'bg-muted/30 border-border text-foreground',
      description: 'Earned for medium-value purchases and continued support'
    },
    {
      id: 3,
      name: 'Gold Badge',
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      description: 'Granted for high-value purchases and loyal engagement'
    },
    {
      id: 4,
      name: 'Diamond Badge',
      icon: <Crown className="h-6 w-6 text-chart-3" />,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      description: 'The ultimate badge for premium supporters and top-tier purchases'
    }
  ]

  // Read badge balances for each badge type
  const { data: bronzeBalance } = useReadContract({
    address: currentContracts.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, 1n] : undefined,
  })

  const { data: silverBalance } = useReadContract({
    address: currentContracts.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, 2n] : undefined,
  })

  const { data: goldBalance } = useReadContract({
    address: currentContracts.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, 3n] : undefined,
  })

  const { data: diamondBalance } = useReadContract({
    address: currentContracts.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address, 4n] : undefined,
  })

  // Update badges when balances change
  useEffect(() => {
    if (address && bronzeBalance !== undefined && silverBalance !== undefined && goldBalance !== undefined && diamondBalance !== undefined) {
      const balances = [bronzeBalance, silverBalance, goldBalance, diamondBalance]
      const userBadges = badgeTypes.map((badge, index) => ({
        ...badge,
        balance: balances[index]
      }))
      setBadges(userBadges)
      setLoading(false)
    } else if (address) {
      setLoading(false)
    }
  }, [address, bronzeBalance, silverBalance, goldBalance, diamondBalance])

  const totalBadges = badges.reduce((sum, badge) => sum + Number(badge.balance), 0)
  const ownedBadgeTypes = badges.filter(badge => badge.balance > 0n).length

  const getContractUrl = (tokenId: number) => {
    return `https://explorer-holesky.morphl2.io/token/${currentContracts.loyaltyToken}?tab=token_transfers&token_id=${tokenId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 font-sans tracking-normal">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="flex justify-center mb-4 sm:mb-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full shadow-lg"
            >
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2"
          >
            <span className="text-primary">
              My Loyalty Dashboard
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-2"
          >
            Your <span className="text-primary font-semibold">verifiable loyalty badges</span> - 
            true digital assets you own, earned through your support on KudoBit.
          </motion.p>
        </motion.div>

        {!isConnected ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 sm:p-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-primary">
                Connect Your Wallet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground px-2 mb-6">
                Connect your wallet to view your earned loyalty badges and see your true digital ownership
              </p>
              <div className="text-xs text-muted-foreground">
                🏆 Your badges are stored directly in your wallet
              </div>
            </div>
          </motion.div>
        ) : loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm sm:text-base text-muted-foreground">Loading your loyalty badges...</p>
          </motion.div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12"
            >
              <Card className="text-center border-primary/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">{totalBadges}</div>
                  <div className="text-sm text-muted-foreground">Total Badges</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-primary/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">{ownedBadgeTypes}</div>
                  <div className="text-sm text-muted-foreground">Badge Types Owned</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-primary/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                    {badges.filter(badge => badge.balance > 0n).length > 0 ? '🏆' : '🎯'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {badges.filter(badge => badge.balance > 0n).length > 0 ? 'Active Supporter' : 'Ready to Earn'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Badge Collection */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className={`overflow-hidden transition-all duration-300 relative ${
                    badge.balance > 0n 
                      ? 'border-primary/40 shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                      : 'border-muted-foreground/20 opacity-60'
                  }`}>
                    <CardHeader className="text-center p-4 sm:p-6">
                      <div className="flex justify-center mb-3">
                        <div className={`p-3 rounded-full ${
                          badge.balance > 0n ? badge.color : 'bg-muted'
                        }`}>
                          {badge.icon}
                        </div>
                      </div>
                      
                      <CardTitle className="text-sm sm:text-base font-semibold">
                        {badge.name}
                      </CardTitle>
                      
                      <div className="flex justify-center items-center gap-2 mt-2">
                        <Badge variant={badge.balance > 0n ? "default" : "secondary"} className="text-xs">
                          {badge.balance > 0n ? `Owned: ${badge.balance.toString()}` : 'Not Earned'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <CardDescription className="text-xs sm:text-sm text-center mb-4">
                        {badge.description}
                      </CardDescription>
                      
                      {badge.balance > 0n && (
                        <div className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-primary/30 hover:bg-primary/10"
                            onClick={() => window.open(getContractUrl(badge.id), '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View on Morphscan
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    
                    {/* Ownership Highlight */}
                    <AnimatePresence>
                      {badge.balance > 0n && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold"
                        >
                          ✓ Owned
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Information Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-primary/30"
            >
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                True Digital Ownership on Morph
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="mb-2">
                    <strong className="text-primary">🔐 You Own Your Badges:</strong> These are ERC-1155 NFTs stored directly in your wallet, 
                    not just database entries that can disappear.
                  </p>
                  <p>
                    <strong className="text-primary">⚡ Instant & Verifiable:</strong> Earned automatically when you make purchases, 
                    with instant confirmation on Morph's hybrid rollup.
                  </p>
                </div>
                <div>
                  <p className="mb-2">
                    <strong className="text-primary">🌐 Future Utility:</strong> These badges can unlock benefits across other creators 
                    and dApps in the Web3 ecosystem.
                  </p>
                  <p>
                    <strong className="text-primary">🏛️ Governance Ready:</strong> Badge holders may participate in future KudoBit DAO 
                    decisions and creator governance.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            {totalBadges === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-8 p-6 bg-gradient-to-r from-card to-primary/10 rounded-lg border border-primary/20"
              >
                <h3 className="text-lg font-semibold mb-2 text-primary">
                  Start Your Loyalty Journey
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Make your first purchase to earn your first loyalty badge and join the KudoBit community
                </p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                  onClick={() => navigate({ to: '/' })}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}