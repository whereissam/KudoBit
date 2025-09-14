import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Search, 
  TrendingUp, 
  Star, 
  Users, 
  Package, 
  Grid, 
  Eye,
  ShoppingCart,
  Award,
  Sparkles
} from 'lucide-react'

interface DiscoverProduct {
  id: number
  name: string
  description: string
  price: string
  creator: {
    displayName: string
    verified: boolean
  }
  category: string
  tags: string[]
  rating: number
  reviewCount: number
  salesCount: number
  trending: boolean
  featured: boolean
}

export const Route = createFileRoute('/marketplace/discover')({
  component: MarketplaceDiscover,
})

function MarketplaceDiscover() {
  const [products, setProducts] = useState<DiscoverProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadMarketplaceData()
  }, [])

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProducts: DiscoverProduct[] = [
        {
          id: 1,
          name: "Premium UI Design Kit",
          description: "Complete UI design system with 200+ components for modern web applications",
          price: "15.99",
          creator: { displayName: "DesignMaster", verified: true },
          category: "Art & Design",
          tags: ["UI", "Design", "Components", "Figma"],
          rating: 4.8,
          reviewCount: 124,
          salesCount: 856,
          trending: true,
          featured: true
        },
        {
          id: 2,
          name: "Epic Orchestral Pack",
          description: "High-quality orchestral samples and loops for cinematic compositions",
          price: "29.99",
          creator: { displayName: "SoundForge", verified: true },
          category: "Music & Audio",
          tags: ["Orchestral", "Cinematic", "Samples", "WAV"],
          rating: 4.9,
          reviewCount: 89,
          salesCount: 432,
          trending: false,
          featured: true
        },
        {
          id: 3,
          name: "Complete React Course",
          description: "Learn React from beginner to advanced with hands-on projects",
          price: "49.99",
          creator: { displayName: "CodeGuru", verified: true },
          category: "Education & Tutorials",
          tags: ["React", "JavaScript", "Tutorial", "Programming"],
          rating: 4.7,
          reviewCount: 256,
          salesCount: 1024,
          trending: true,
          featured: false
        }
      ]
      
      setProducts(mockProducts)
    } catch (error) {
      console.error('Failed to load marketplace data:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.creator.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Discover Marketplace</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore amazing digital products from talented creators worldwide
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products, creators, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full max-w-md"
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms
            </p>
            <Button onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center relative">
                <Package className="h-12 w-12 text-primary/60" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {product.featured && (
                    <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.trending && (
                    <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">by</span>
                  <span className="font-medium">{product.creator.displayName}</span>
                  {product.creator.verified && (
                    <Award className="h-3 w-3 text-chart-2" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-chart-2 text-chart-2" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {product.salesCount} sales
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ${product.price} USDC
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {product.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <div className="p-4 pt-0 flex gap-2">
                <Button className="flex-1" size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}