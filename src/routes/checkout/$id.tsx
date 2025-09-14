import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShoppingCart, CreditCard, Wallet, CheckCircle, AlertCircle, Loader2, Shield, Zap } from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, PRODUCT_NFT_ABI, GUMROAD_CORE_ABI, MOCK_USDC_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/checkout/$id')({
  component: CheckoutPage,
})

type CheckoutStep = 'review' | 'payment' | 'processing' | 'complete'

function CheckoutPage() {
  const { id } = Route.useParams()
  const { address, isConnected } = useAccount()
  const [step, setStep] = useState<CheckoutStep>('review')
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'eth'>('usdc')
  
  const productId = parseInt(id)

  // Get product details
  const { data: product } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'products',
    args: [BigInt(productId)],
  })

  // Get user balances
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Check if user has already purchased
  const { data: hasPurchased } = useReadContract({
    address: CONTRACTS.gumroadCore,
    abi: GUMROAD_CORE_ABI,
    functionName: 'hasPurchased',
    args: [BigInt(productId), address || '0x0'],
    query: { enabled: !!address },
  })

  // Purchase transaction
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getProductEmoji = (productId: number) => {
    const emojis = ['📄', '🖼️', '🎫', '📦', '🎨', '📚', '🎵', '📹', '🎮', '🔧']
    return emojis[productId % emojis.length]
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <Wallet className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">You need to connect your wallet to proceed with checkout</p>
            <Button asChild>
              <Link to={`/product/${id}`}>Go back to product</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/">
          <Button variant="outline">Back to shop</Button>
        </Link>
      </div>
    )
  }

  if (hasPurchased) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-500" />
            <h2 className="text-2xl font-bold mb-4">Already Owned</h2>
            <p className="text-muted-foreground mb-6">You already own this product</p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link to={`/product/${id}`}>View Product</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/account/purchases">My Purchases</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const [name, description, price, active, creator] = product
  const priceInUSDC = formatUnits(price, 6)

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Purchase Complete! 🎉</h1>
              <p className="text-lg text-muted-foreground">
                You successfully purchased <strong>{name}</strong>
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 rounded-lg flex items-center justify-center text-2xl">
                    {getProductEmoji(productId)}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold">{name}</h3>
                    <p className="text-sm text-muted-foreground">by {formatAddress(creator)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-morph-green-600">{priceInUSDC} USDC</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Transaction Hash:</span>
                    <span className="font-mono text-xs">{hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Block Explorer:</span>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      View on Explorer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                Your NFT ownership is now secured on the blockchain
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link to={`/product/${id}`}>View Product</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/account/purchases">My Purchases</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/discover">Discover More</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const handlePurchase = () => {
    if (!address || !product) return
    
    setStep('processing')
    
    writeContract({
      address: CONTRACTS.gumroadCore,
      abi: GUMROAD_CORE_ABI,
      functionName: 'purchaseProduct',
      args: [BigInt(productId), CONTRACTS.mockUSDC],
    })
  }

  const hasEnoughBalance = usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)) >= parseFloat(priceInUSDC) : false

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/product/${id}`}>
            <motion.button 
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to product
            </motion.button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                Secure Checkout
              </span>
            </h1>
            <p className="text-muted-foreground">Complete your purchase on Morph's lightning-fast network</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 rounded-lg flex items-center justify-center text-2xl">
                      {getProductEmoji(productId)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          by {formatAddress(creator)}
                        </Badge>
                        <Badge className="text-xs">NFT</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Product Price:</span>
                      <span className="font-semibold">{priceInUSDC} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee:</span>
                      <span className="text-muted-foreground">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas Fees:</span>
                      <span className="text-muted-foreground">~0.001 ETH</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-morph-green-600">{priceInUSDC} USDC</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What You Get */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What you'll receive</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Instant NFT ownership certificate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Lifetime access to content</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Resale rights on secondary markets</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Blockchain-verified authenticity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {step === 'processing' || isPending || isConfirming ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-morph-green-500" />
                    <h3 className="text-lg font-semibold mb-2">Processing Transaction</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please wait while your transaction is being processed on Morph...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3 text-morph-green-500" />
                      Lightning-fast confirmation times on Morph
                    </div>
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600">
                        Transaction failed: {error.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                      <CardDescription>Choose your preferred payment method</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            paymentMethod === 'usdc' ? 'border-morph-green-500 bg-morph-green-50/50 dark:bg-morph-green-900/10' : 'border-border'
                          }`}
                          onClick={() => setPaymentMethod('usdc')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              💰
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">USDC</div>
                              <div className="text-sm text-muted-foreground">
                                Balance: {usdcBalance ? formatUnits(usdcBalance, 6) : '0.00'} USDC
                              </div>
                            </div>
                            {paymentMethod === 'usdc' && (
                              <CheckCircle className="h-5 w-5 text-morph-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      {!hasEnoughBalance ? (
                        <div className="text-center space-y-4">
                          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
                          <div>
                            <h3 className="font-semibold mb-2">Insufficient Balance</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              You need {priceInUSDC} USDC but only have {usdcBalance ? formatUnits(usdcBalance, 6) : '0.00'} USDC
                            </p>
                          </div>
                          <Button disabled className="w-full">
                            Insufficient USDC Balance
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Button 
                            onClick={handlePurchase} 
                            className="w-full h-12 text-lg"
                            disabled={!active || isPending || isConfirming}
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            {isPending || isConfirming ? 'Processing...' : `Pay ${priceInUSDC} USDC`}
                          </Button>
                          
                          <div className="text-xs text-muted-foreground text-center space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Shield className="h-3 w-3 text-green-500" />
                              Secured by blockchain technology
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <Zap className="h-3 w-3 text-morph-green-500" />
                              Instant ownership transfer
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}