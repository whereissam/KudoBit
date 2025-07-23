import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Award, Send } from 'lucide-react'
import { useWriteContract, useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, LOYALTY_TOKEN_ABI, MOCK_USDC_ABI, SHOPFRONT_ABI } from '@/lib/contracts'
import { useState } from 'react'
import { isAddress, parseUnits, formatUnits } from 'viem'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/admin')({
  component: AdminPanel,
})

function AdminPanel() {
  const { address } = useAccount()
  const [recipientAddress, setRecipientAddress] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')
  const [badgeAmount, setBadgeAmount] = useState('1')
  const [usdcAmount, setUsdcAmount] = useState('100')
  const [isMinting, setIsMinting] = useState(false)
  const [isMintingUSDC, setIsMintingUSDC] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const { writeContract: mintBadge } = useWriteContract()
  const { writeContract: mintUSDC } = useWriteContract()
  const { writeContract: withdrawFunds } = useWriteContract()

  // Get merchant balance in the contract
  const { data: merchantBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: [CONTRACTS.shopfront],
    query: { enabled: !!address }
  })

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
        address: CONTRACTS.loyaltyToken,
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

  const handleMintUSDC = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsMintingUSDC(true)
      toast.loading('Claiming USDC...', { id: 'claim-usdc' })
      
      const amount = parseUnits(usdcAmount, 6) // USDC has 6 decimals
      await mintUSDC({
        address: CONTRACTS.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
        args: [amount],
      })
      
      toast.success(`${usdcAmount} USDC claimed successfully!`, { id: 'claim-usdc' })
      setUsdcAmount('100')
    } catch (error: any) {
      console.error('Failed to claim USDC:', error)
      toast.error(`Failed to claim USDC: ${error?.shortMessage || 'Unknown error'}`, { id: 'claim-usdc' })
    } finally {
      setIsMintingUSDC(false)
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
        address: CONTRACTS.shopfront,
        abi: SHOPFRONT_ABI,
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Admin Panel
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Manage loyalty badges and test tokens for the Morph Commerce platform.
          </p>
        </div>

        {!address ? (
          <div className="text-center p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Connect Your Wallet</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Connect your admin wallet to access management functions
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Badge Minting Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Award Loyalty Badge
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manually award loyalty badges to users. This simulates the automatic awarding that would happen after purchases in production.
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
                  disabled={isMinting || !recipientAddress || !selectedBadge}
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

            {/* USDC Faucet Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  USDC Test Faucet
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Get test USDC tokens for testing purchases. Each address can claim up to 1000 USDC from the faucet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="usdc-amount" className="text-sm">Amount (USDC)</Label>
                    <Input
                      id="usdc-amount"
                      type="number"
                      min="1"
                      max="1000"
                      value={usdcAmount}
                      onChange={(e) => setUsdcAmount(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="sm:flex sm:items-end">
                    <Button
                      onClick={handleMintUSDC}
                      disabled={isMintingUSDC}
                      className="w-full sm:w-auto sm:mt-6 text-sm sm:text-base px-4 sm:px-6"
                    >
                      {isMintingUSDC ? (
                        <span className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                          <span className="hidden sm:inline">Claiming...</span>
                          <span className="sm:hidden">Claiming</span>
                        </span>
                      ) : (
                        <span>
                          <span className="hidden sm:inline">Claim Test USDC</span>
                          <span className="sm:hidden">Claim USDC</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Merchant Earnings Withdrawal Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  Merchant Earnings
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View and withdraw earnings from digital product sales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold text-morph-green-600">
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
                  disabled={isWithdrawing || !merchantBalance || merchantBalance === 0n}
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
                  <p>• This admin panel is for demonstration purposes only</p>
                  <p>• In production, badge awarding would be automatic upon purchase completion</p>
                  <p>• The USDC faucet provides test tokens for the Morph Holesky testnet</p>
                  <p>• Badge minting requires owner privileges on the LoyaltyToken contract</p>
                  <p>• All transactions are processed on Morph's hybrid rollup for fast, low-cost execution</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}