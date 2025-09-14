import { createFileRoute } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Wallet,
  Clock,
  Loader2
} from 'lucide-react'
import { formatUnits, parseUnits } from 'viem'
import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/creator/earnings')({
  component: CreatorEarnings,
})

interface EarningsPeriod {
  period: string
  amount: bigint
  sales: number
  change: string
}

function CreatorEarnings() {
  const { address, isConnected } = useAccount()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // const { data: usdcBalance } = useReadContract({
  //   address: CONTRACTS.mockUSDC,
  //   abi: MOCK_USDC_ABI,
  //   functionName: 'balanceOf',
  //   args: address ? [address] : undefined,
  // })

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-muted-foreground">
            Connect your wallet to view your earnings
          </p>
        </div>
      </div>
    )
  }

  // Mock earnings data - in production, this would come from smart contracts/indexer
  const totalEarned = BigInt('2500000000') // 2500 USDC
  const availableBalance = BigInt('1800000000') // 1800 USDC
  const pendingBalance = BigInt('200000000') // 200 USDC
  const totalWithdrawn = BigInt('500000000') // 500 USDC

  const earningsPeriods: EarningsPeriod[] = [
    { period: 'This Month', amount: BigInt('850000000'), sales: 34, change: '+12.5%' },
    { period: 'Last Month', amount: BigInt('750000000'), sales: 28, change: '+8.2%' },
    { period: 'Last 7 Days', amount: BigInt('320000000'), sales: 12, change: '+15.3%' },
    { period: 'Yesterday', amount: BigInt('45000000'), sales: 2, change: '+25.0%' }
  ]

  const recentTransactions = [
    { id: 1, type: 'sale', product: 'Exclusive Wallpaper NFT', amount: BigInt('10000000'), date: '2 hours ago', buyer: '0x1234...5678' },
    { id: 2, type: 'withdrawal', product: 'Withdrawal to wallet', amount: BigInt('-100000000'), date: '1 day ago', buyer: 'Self' },
    { id: 3, type: 'sale', product: 'Digital Sticker Pack', amount: BigInt('5000000'), date: '2 days ago', buyer: '0x9876...4321' },
    { id: 4, type: 'royalty', product: 'Secondary sale royalty', amount: BigInt('2500000'), date: '3 days ago', buyer: '0x5555...1111' }
  ]

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const amountInWei = parseUnits(withdrawAmount, 6)
    if (amountInWei > availableBalance) {
      toast.error('Insufficient balance')
      return
    }

    setIsWithdrawing(true)
    try {
      // Mock withdrawal - implement smart contract call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Successfully withdrew ${withdrawAmount} USDC`)
      setWithdrawAmount('')
    } catch (error) {
      toast.error('Withdrawal failed')
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            Track your revenue and manage withdrawals
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">{formatUnits(totalEarned, 6)} USDC</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All time
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{formatUnits(availableBalance, 6)} USDC</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Ready to withdraw
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{formatUnits(pendingBalance, 6)} USDC</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Processing
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Withdrawn</p>
                  <p className="text-2xl font-bold">{formatUnits(totalWithdrawn, 6)} USDC</p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    Total withdrawn
                  </p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Download className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Earnings</CardTitle>
                <CardDescription>
                  Transfer your earnings to your wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (USDC)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={formatUnits(availableBalance, 6)}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Available: {formatUnits(availableBalance, 6)} USDC</span>
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setWithdrawAmount(formatUnits(availableBalance, 6))}
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destination</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono">{address}</p>
                    <p className="text-xs text-muted-foreground mt-1">Your connected wallet</p>
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="w-full"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Withdraw
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Withdrawals are processed instantly. Network fees apply.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings by Period */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>
                  Your earnings breakdown by time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsPeriods.map((period, index) => (
                    <motion.div
                      key={period.period}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{period.period}</p>
                          <p className="text-sm text-muted-foreground">
                            {period.sales} sales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatUnits(period.amount, 6)} USDC</p>
                        <p className="text-xs text-green-600">{period.change}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest earnings and withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'sale' 
                        ? 'bg-green-100' 
                        : transaction.type === 'withdrawal'
                        ? 'bg-blue-100'
                        : 'bg-purple-100'
                    }`}>
                      {transaction.type === 'sale' && (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      )}
                      {transaction.type === 'withdrawal' && (
                        <ArrowDownRight className="h-5 w-5 text-blue-600" />
                      )}
                      {transaction.type === 'royalty' && (
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.product}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{transaction.buyer}</span>
                        <span>•</span>
                        <span>{transaction.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}
                      {formatUnits(transaction.amount, 6)} USDC
                    </p>
                    <Badge variant={
                      transaction.type === 'sale' 
                        ? 'default' 
                        : transaction.type === 'withdrawal'
                        ? 'secondary'
                        : 'outline'
                    }>
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}