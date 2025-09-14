import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap, CheckCircle, User, ShoppingCart } from 'lucide-react'
import { useReadContract, useAccount } from 'wagmi'
import { CONTRACTS, PRODUCT_NFT_ABI, GUMROAD_CORE_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/product/$id')({
  component: ProductDetail,
})

function ProductDetail() {
  const { id } = Route.useParams()
  const { address } = useAccount()
  const productId = parseInt(id)

  // Get product details from ProductNFT contract
  const { data: product } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'products',
    args: [BigInt(productId)],
  })

  // Get content hash
  const { data: contentHash } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'contentHashes',
    args: [BigInt(productId)],
  })

  // Check if user has purchased this product
  const { data: hasPurchased } = useReadContract({
    address: CONTRACTS.gumroadCore,
    abi: GUMROAD_CORE_ABI,
    functionName: 'hasPurchased',
    args: [BigInt(productId), address || '0x0'],
    query: { enabled: !!address },
  })

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/">
          <button className="text-blue-500 hover:text-blue-600">← Back to discover</button>
        </Link>
      </div>
    )
  }

  const [name, description, price, active, creator] = product

  const getProductImage = (productId: number) => {
    const images = {
      1: '🖼️',
      2: '🎫',  
      3: '📦',
      4: '🎨',
      5: '📚',
    }
    return images[productId as keyof typeof images] || '📄'
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/">
          <motion.button 
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </motion.button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 rounded-lg flex items-center justify-center text-9xl border-2 border-morph-green-200/30">
              {getProductImage(Number(id))}
            </div>
            
            {/* Morph branding */}
            <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-muted-foreground">
              ⚡ Powered by Morph
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title & Creator */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <h1 className="text-3xl font-bold flex-1">{name}</h1>
                <Badge variant="outline" className="shrink-0">
                  <User className="h-3 w-3 mr-1" />
                  {formatAddress(creator)}
                </Badge>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {/* Price & Status */}
            <div className="bg-gradient-to-r from-card to-morph-green-50/50 dark:to-morph-green-900/10 rounded-lg p-6 border border-morph-green-200/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Price</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
                    {formatUnits(price, 6)} USDC
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Zap className="h-4 w-4 mr-1 text-morph-green-500" />
                    Morph Testnet
                  </div>
                  {hasPurchased && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Owned
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">What you get:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-morph-green-500" />
                  <span className="text-sm">Instant digital delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-morph-green-500" />
                  <span className="text-sm">NFT ownership certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-morph-green-500" />
                  <span className="text-sm">Lifetime access to content</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-morph-green-500" />
                  <span className="text-sm">Resellable on secondary markets</span>
                </div>
              </div>
            </div>

            {/* Purchase Section */}
            <Card className="border-morph-green-200/30">
              <CardContent className="p-6">
                {hasPurchased ? (
                  <div className="text-center space-y-4">
                    <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      You own this product
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Access your content using the contract at {formatAddress(CONTRACTS.contentAccess)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      className="w-full h-12 text-lg" 
                      disabled={!active || !address}
                      asChild={active && address ? true : false}
                    >
                      {active && address ? (
                        <Link to={`/checkout/${productId}`}>
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Buy for {formatUnits(price, 6)} USDC
                        </Link>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          {!address ? 'Connect Wallet' : 'Unavailable'}
                        </>
                      )}
                    </Button>
                    
                    <div className="mt-4 text-xs text-muted-foreground text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-3 w-3 text-morph-green-500" />
                        Secured by blockchain • Instant ownership transfer
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Profile Section */}
            <Card className="border-morph-purple-200/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-morph-purple-100 to-morph-green-100 dark:from-morph-purple-900/30 dark:to-morph-green-900/30 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-morph-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Creator</h4>
                    <p className="text-sm text-muted-foreground mb-3">{formatAddress(creator)}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        Follow
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                ❤️ Add to Wishlist
              </Button>
              <Button variant="outline" className="flex-1">
                📤 Share
              </Button>
            </div>

            {/* Tech Details */}
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                <div>Product ID: #{productId}</div>
                <div>Standard: ERC-721</div>
                <div>Creator: {formatAddress(creator)}</div>
                <div>Status: {active ? 'Active' : 'Inactive'}</div>
                {contentHash && <div className="col-span-2">IPFS: {contentHash.slice(0, 20)}...</div>}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews & Related Products Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 space-y-12"
        >
          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <Badge variant="secondary">0 reviews</Badge>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to review this product and help others make informed decisions.
                </p>
                {hasPurchased && (
                  <Button variant="outline">
                    Write a Review
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Related Products */}
          <div>
            <h2 className="text-2xl font-bold mb-6">More from this creator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mock related products */}
              <Card className="hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 flex items-center justify-center text-4xl">
                  🎨
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Digital Art Pack</h3>
                  <p className="text-sm text-muted-foreground mb-3">High-quality digital art collection</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-morph-green-600">12.50 USDC</span>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 flex items-center justify-center text-4xl">
                  🖼️
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">NFT Collection</h3>
                  <p className="text-sm text-muted-foreground mb-3">Exclusive NFT artwork series</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-morph-green-600">25.00 USDC</span>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 flex items-center justify-center text-4xl">
                  📚
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Design Guide</h3>
                  <p className="text-sm text-muted-foreground mb-3">Complete guide to digital design</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-morph-green-600">18.75 USDC</span>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}