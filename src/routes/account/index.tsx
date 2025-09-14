import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, ShoppingBag, Heart, Settings, Wallet, Award, TrendingUp } from 'lucide-react'
import { useAccount, useReadContract, useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { CONTRACTS, MOCK_USDC_ABI } from '@/lib/contracts'

export const Route = createFileRoute('/account/')({
  component: AccountOverview,
})

function AccountOverview() {
  const { address, isConnected } = useAccount()

  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: ethBalance } = useBalance({ address })

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
        <div className="container mx-auto px-3 sm:px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-morph-green-100 to-morph-purple-100 dark:from-morph-green-900/30 dark:to-morph-purple-900/30 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-morph-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to view your account details and purchase history
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
      <div className="container mx-auto px-3 sm:px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-morph-green-100 to-morph-purple-100 dark:from-morph-green-900/30 dark:to-morph-purple-900/30 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-morph-green-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                  My Account
                </span>
              </h1>
              <p className="text-muted-foreground">{formatAddress(address!)}</p>
            </div>
          </div>
        </motion.div>

        {/* Balance Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {ethBalance && (
            <Card className="bg-gradient-to-br from-morph-green-50/50 to-transparent dark:from-morph-green-900/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
                <Wallet className="h-4 w-4 text-morph-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-morph-green-600">
                  {parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)} {ethBalance.symbol}
                </div>
              </CardContent>
            </Card>
          )}
          
          {usdcBalance && (
            <Card className="bg-gradient-to-br from-morph-purple-50/50 to-transparent dark:from-morph-purple-900/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">USDC Balance</CardTitle>
                <Award className="h-4 w-4 text-morph-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-morph-purple-600">
                  {formatUnits(usdcBalance, 6)} USDC
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <Link to="/account/purchases">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-sm">My Purchases</CardTitle>
                <CardDescription className="text-xs">View purchase history</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <Link to="/account/wishlist">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-sm">Wishlist</CardTitle>
                <CardDescription className="text-xs">Saved items</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <Link to="/discover">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-sm">Discover</CardTitle>
                <CardDescription className="text-xs">Browse products</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <Link to="/account/settings">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <CardTitle className="text-sm">Settings</CardTitle>
                <CardDescription className="text-xs">Account preferences</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </motion.div>

        {/* Account Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-morph-green-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/discover">Browse Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-morph-purple-500" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Purchases</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Items in Wishlist</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <Badge>Buyer</Badge>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/creator">Become a Creator</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}