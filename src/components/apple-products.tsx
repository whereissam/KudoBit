import { Button } from '@/components/ui/button'
import { formatUnits } from 'viem'
import { Star, ArrowRight } from 'lucide-react'

interface Product {
  id: bigint
  name: string
  description: string
  ipfsContentHash: string
  priceInUSDC: bigint
  isActive: boolean
  loyaltyBadgeId: bigint
  category?: string
  views?: number
  sales?: number
  rating?: number
}

interface AppleProductsProps {
  products: Product[]
  isLoading: boolean
  onBuyProduct: (productId: number, price: bigint) => void
  isTransacting: boolean
  currentProductId: number | null
}

export function AppleProducts({ products, isLoading, onBuyProduct, isTransacting, currentProductId }: AppleProductsProps) {
  if (isLoading) {
    return (
      <div className="bg-background py-20 font-sans tracking-normal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading amazing products...</p>
          </div>
        </div>
      </div>
    )
  }

  const featuredProducts = products.slice(0, 6)

  return (
    <div className="bg-background py-20 font-sans tracking-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Discover amazing digital products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From exclusive content to digital tools, find products that inspire and empower your creativity.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id.toString()}
              className="group bg-background rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
                {/* Category Icon */}
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {product.category === 'Art & Design' && '🎨'}
                  {product.category === 'Education & Tutorials' && '📚'}
                  {product.category === 'Developer Tools' && '⚡'}
                  {product.category === 'Finance & Trading' && '📈'}
                  {product.category === 'Music & Audio' && '🎵'}
                  {!product.category && '💎'}
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge */}
                {product.rating && (
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Category & Stats */}
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-1 rounded-full">
                    {product.category || 'Digital Product'}
                  </span>
                  <div className="flex items-center space-x-3">
                    {product.views && (
                      <span>{product.views} views</span>
                    )}
                    {product.sales && (
                      <span>{product.sales} sold</span>
                    )}
                  </div>
                </div>

                {/* Price & Buy Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatUnits(product.priceInUSDC, 6)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">USDC</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onBuyProduct(Number(product.id), product.priceInUSDC)}
                    disabled={isTransacting && currentProductId === Number(product.id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {isTransacting && currentProductId === Number(product.id) ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Buying...
                      </div>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {products.length > 6 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-border hover:border-gray-400 text-foreground px-8 py-3 rounded-full font-medium transition-all duration-200"
              onClick={() => {
                // Scroll to top to see all products
                window.scrollTo({ top: 0, behavior: 'smooth' })
                // Clear any search filters to show all products
                const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
                if (searchInput) {
                  searchInput.value = ''
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }}
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}