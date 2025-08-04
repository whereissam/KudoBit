import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Award, DollarSign } from 'lucide-react'
import { useAccount } from 'wagmi'

export const Route = createFileRoute('/index-minimal')({
  component: MinimalKudoBitShop,
})

function MinimalKudoBitShop() {
  const { address, isConnected } = useAccount()

  // Static mock products - no blockchain calls
  const products = [
    {
      id: 1,
      name: "Exclusive Wallpaper NFT",
      description: "High-quality digital wallpaper collection",
      price: "0.2",
      badge: "Bronze Badge"
    },
    {
      id: 2, 
      name: "1-Month Premium Content Pass",
      description: "Access to premium content for 30 days",
      price: "0.5",
      badge: "Silver Badge"
    },
    {
      id: 3,
      name: "Digital Sticker Pack", 
      description: "Collection of unique digital stickers",
      price: "0.05",
      badge: "Bronze Badge"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-4">
            <span className="text-primary">KudoBit</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            <span className="text-primary font-semibold">Digital Value, Instantly Rewarded.</span><br/>
            The <span className="text-primary font-semibold">Web3 Gumroad</span> - empowering creators
          </p>

          {isConnected && (
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="bg-card rounded-lg px-6 py-3 border">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">MockUSDC:</span>
                  <span className="font-semibold text-primary">1000.0 USDC</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {!isConnected ? (
          <div className="text-center p-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to experience the future of creator commerce
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  <div className="text-6xl">
                    {product.id === 1 && '🖼️'}
                    {product.id === 2 && '🎫'}  
                    {product.id === 3 && '📦'}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="flex flex-col gap-2">
                    <span className="font-semibold">{product.name}</span>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 w-fit">
                      <Award className="h-3 w-3 mr-1" />
                      {product.badge}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary">
                      {product.price} USDC
                    </span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}