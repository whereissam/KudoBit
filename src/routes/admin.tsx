import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Award } from 'lucide-react'
import { useWriteContract, useAccount, useReadContract, useChainId } from 'wagmi'
import { CONTRACTS, getContracts, LOYALTY_TOKEN_ABI, CREATOR_STORE_ABI, MOCK_USDC_ABI } from '@/lib/contracts'
import { CreatorAuth } from '@/components/creator-auth'
import { useState, useMemo } from 'react'
import { isAddress, formatUnits } from 'viem'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/admin')({
  component: AdminPanel,
})

function AdminPanel() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [recipientAddress, setRecipientAddress] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')
  const [badgeAmount, setBadgeAmount] = useState('1')
  const [isMinting, setIsMinting] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  
  // Get contracts for current chain
  const currentContracts = useMemo(() => getContracts(chainId), [chainId])

  const { writeContract: mintBadge } = useWriteContract()
  const { writeContract: withdrawFunds } = useWriteContract()

  // Check if connected address is owner of CreatorStore contract
  const { data: creatorStoreOwner } = useReadContract({
    address: currentContracts.creatorStore,
    abi: CREATOR_STORE_ABI,
    functionName: 'owner',
    chainId,
    account: address,
    query: { enabled: !!address }
  })

  // Check if connected address is owner of LoyaltyToken contract  
  const { data: loyaltyTokenOwner } = useReadContract({
    address: currentContracts.loyaltyToken,
    abi: LOYALTY_TOKEN_ABI,
    functionName: 'owner',
    chainId,
    account: address,
    query: { enabled: !!address }
  })

  // Get merchant MockUSDC balance in the contract
  const { data: merchantBalance, refetch: refetchBalance } = useReadContract({
    address: currentContracts.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: [currentContracts.creatorStore],
    chainId,
    account: address,
  })

  // Check if user has admin privileges
  const isCreatorStoreOwner = address && creatorStoreOwner && address.toLowerCase() === (creatorStoreOwner as string).toLowerCase()
  const isLoyaltyTokenOwner = address && loyaltyTokenOwner && address.toLowerCase() === (loyaltyTokenOwner as string).toLowerCase()
  const hasAdminAccess = isCreatorStoreOwner || isLoyaltyTokenOwner

  const badges = [
    { id: '1', name: 'Bronze Badge', description: 'Basic tier badge' },
    { id: '2', name: 'Silver Badge', description: 'Premium tier badge' },
    { id: '3', name: 'Gold Badge', description: 'Elite tier badge' },
    { id: '4', name: 'Diamond Badge', description: 'Ultimate tier badge' },
  ]

  const handleMintBadge = async () => {
    if (!recipientAddress || !selectedBadge || !isAddress(recipientAddress)) {
      toast.error('Please enter a valid recipient address and select a badge')
      return
    }

    try {
      setIsMinting(true)
      toast.loading('Minting badge...', { id: 'mint-badge' })
      
      await mintBadge({
        address: currentContracts.loyaltyToken,
        abi: LOYALTY_TOKEN_ABI,
        functionName: 'mintBadge',
        args: [recipientAddress as `0x${string}`, BigInt(selectedBadge), BigInt(badgeAmount)],
      })
      
      toast.success('Badge minted successfully!', { id: 'mint-badge' })
      setRecipientAddress('')
      setSelectedBadge('')
      setBadgeAmount('1')
    } catch (error: any) {
      console.error('Failed to mint badge:', error)
      toast.error(`Failed to mint badge: ${error?.shortMessage || 'Unknown error'}`, { id: 'mint-badge' })
    } finally {
      setIsMinting(false)
    }
  }


  const handleWithdrawFunds = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsWithdrawing(true)
      toast.loading('Withdrawing funds...', { id: 'withdraw-funds' })
      
      await withdrawFunds({
        address: currentContracts.creatorStore,
        abi: CREATOR_STORE_ABI,
        functionName: 'withdrawFunds',
      })
      
      toast.success('Funds withdrawn successfully!', { id: 'withdraw-funds' })
      refetchBalance()
    } catch (error: any) {
      console.error('Failed to withdraw funds:', error)
      toast.error(`Failed to withdraw funds: ${error?.shortMessage || 'Unknown error'}`, { id: 'withdraw-funds' })
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted font-sans tracking-normal">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-destructive/10 rounded-full shadow-md">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            <span className="text-primary">KudoBit Creator Admin</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Demo panel for managing loyalty badges and creator earnings on KudoBit.
          </p>
        </div>

        {!address ? (
          <div className="text-center p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Connect Your Wallet</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Connect your admin wallet to access management functions
            </p>
          </div>
        ) : !hasAdminAccess ? (
          <div className="text-center p-6 sm:p-8">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-4">
              <Settings className="h-8 w-8 text-destructive dark:text-red-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-destructive dark:text-red-400">Access Denied</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-2 mb-4">
              You don't have admin privileges to access this panel.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 text-left">
              <p className="text-xs font-medium mb-2">Admin Access Requirements:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Must be owner of CreatorStore contract</li>
                <li>• OR owner of LoyaltyToken contract</li>
                <li>• Current address: <code className="bg-muted px-1 rounded">{address?.slice(0, 8)}...{address?.slice(-6)}</code></li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Creator Authentication Section */}
            <CreatorAuth />
            
            {/* Badge Minting Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Award Loyalty Badge
                  {isLoyaltyTokenOwner ? (
                    <span className="text-xs bg-chart-1/10 dark:bg-green-900/30 text-chart-1 dark:text-green-400 px-2 py-1 rounded">
                      Authorized
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-destructive dark:text-red-400 px-2 py-1 rounded">
                      No Access
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manually award loyalty badges to users. Requires LoyaltyToken contract ownership.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-sm">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      value={badgeAmount}
                      onChange={(e) => setBadgeAmount(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="badge-select" className="text-sm">Badge Type</Label>
                  <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a badge to award" />
                    </SelectTrigger>
                    <SelectContent>
                      {badges.map((badge) => (
                        <SelectItem key={badge.id} value={badge.id} className="text-sm">
                          <span className="hidden sm:inline">{badge.name} - {badge.description}</span>
                          <span className="sm:hidden">{badge.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleMintBadge}
                  disabled={isMinting || !recipientAddress || !selectedBadge || !isLoyaltyTokenOwner}
                  className="w-full text-sm sm:text-base"
                >
                  {isMinting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      Minting...
                    </span>
                  ) : (
                    'Award Badge'
                  )}
                </Button>
              </CardContent>
            </Card>


            {/* Merchant Earnings Withdrawal Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Merchant Earnings
                  {isCreatorStoreOwner ? (
                    <span className="text-xs bg-chart-1/10 dark:bg-green-900/30 text-chart-1 dark:text-green-400 px-2 py-1 rounded">
                      Authorized
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-destructive dark:text-red-400 px-2 py-1 rounded">
                      No Access
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View and withdraw earnings from digital product sales. Requires CreatorStore contract ownership.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold text-primary">
                        {merchantBalance ? formatUnits(merchantBalance, 6) : '0.00'} USDC
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Sales Revenue</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleWithdrawFunds}
                  disabled={isWithdrawing || !merchantBalance || merchantBalance === 0n || !isCreatorStoreOwner}
                  className="w-full text-sm sm:text-base"
                >
                  {isWithdrawing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      Withdrawing...
                    </span>
                  ) : (
                    'Withdraw Earnings'
                  )}
                </Button>
                
                {(!merchantBalance || merchantBalance === 0n) && (
                  <p className="text-xs text-muted-foreground text-center">
                    No earnings available for withdrawal
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Info Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Demo Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Important notes about this admin panel for hackathon demonstration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6">
                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <p>• This admin panel is for hackathon demonstration purposes only</p>
                  <p>• In production, badge awarding would be fully automated upon purchase completion</p>
                  <p>• The MockUSDC faucet provides test tokens for the Morph Holesky testnet</p>
                  <p>• Manual badge minting demonstrates the loyalty system but isn't needed in production</p>
                  <p>• All transactions leverage Morph's hybrid rollup for ultra-low fees and instant finality</p>
                  <p>• This showcases KudoBit's "Web3 Gumroad" vision with true creator sovereignty</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}