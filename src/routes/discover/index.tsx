import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Grid3X3, List, User, Zap, Package, Loader2 } from 'lucide-react'
import { useReadContract, useAccount } from 'wagmi'
import { CONTRACTS, PRODUCT_NFT_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/discover/')({
  component: Discover,
})

const categories = [
  'All',
  'Digital Art',
  'Music',
  'Software',
  'Templates',
  'Courses',
  'E-books',
  'Games',
  'Photography',
  'Other'
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' }
]

function Discover() {
  const { isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' })

  // Get total product count
  const { data: productCounter, isLoading: counterLoading } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'productCounter',
  })

  const productIds = productCounter ? Array.from({ length: Number(productCounter) }, (_, i) => i + 1) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-morph-green-50/5 to-morph-purple-50/5">
      <div className="container mx-auto px-3 sm:px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-morph-green-600 to-morph-purple-600 bg-clip-text text-transparent">
              Discover Digital Products
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of digital products created by talented creators worldwide
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, creators, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Price Range */}
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Min price"
                    value={priceFilter.min}
                    onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                    className="w-24"
                    type="number"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    placeholder="Max price"
                    value={priceFilter.max}
                    onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                    className="w-24"
                    type="number"
                  />
                  <span className="text-sm text-muted-foreground">USDC</span>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none border-l"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Category Tags */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid/List */}
        {!isConnected ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-morph-green-100 to-morph-purple-100 dark:from-morph-green-900/30 dark:to-morph-purple-900/30 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-morph-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to discover and purchase amazing digital products
              </p>
            </div>
          </motion.div>
        ) : counterLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-morph-green-500" />
            <p className="text-muted-foreground">Loading products...</p>
          </motion.div>
        ) : productIds.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12"
          >
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }
          >
            {productIds.map((productId, index) => (
              <ProductCard 
                key={productId} 
                productId={productId} 
                index={index}
                viewMode={viewMode}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                priceFilter={priceFilter}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ 
  productId, 
  index, 
  viewMode, 
  searchQuery, 
 
  priceFilter 
}: { 
  productId: number
  index: number
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedCategory: string
  priceFilter: { min: string; max: string }
}) {
  const { data: product } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'products',
    args: [BigInt(productId)],
  })

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getProductEmoji = (productId: number) => {
    const emojis = ['📄', '🖼️', '🎫', '📦', '🎨', '📚', '🎵', '📹', '🎮', '🔧']
    return emojis[productId % emojis.length]
  }

  if (!product) return null

  const [name, description, price, active, creator] = product
  if (!active) return null

  // Apply filters
  const priceInUSDC = parseFloat(formatUnits(price, 6))
  
  // Search filter
  if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !description.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null
  }

  // Price filter
  if (priceFilter.min && priceInUSDC < parseFloat(priceFilter.min)) return null
  if (priceFilter.max && priceInUSDC > parseFloat(priceFilter.max)) return null

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="p-4 hover:shadow-lg transition-all duration-300">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 rounded-lg flex items-center justify-center text-3xl">
              {getProductEmoji(productId)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <Link to="/product/$id" params={{ id: productId.toString() }}>
                  <h3 className="font-semibold hover:text-morph-green-600 transition-colors">{name}</h3>
                </Link>
                <span className="text-lg font-bold text-morph-green-600">
                  {formatUnits(price, 6)} USDC
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {formatAddress(creator)}
                </Badge>
                <Button size="sm" asChild>
                  <Link to="/product/$id" params={{ id: productId.toString() }}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <Link to="/product/$id" params={{ id: productId.toString() }}>
          <div className="aspect-video bg-gradient-to-br from-morph-green-50 to-morph-purple-50 dark:from-morph-green-900/20 dark:to-morph-purple-900/20 flex items-center justify-center relative group">
            <div className="text-6xl group-hover:scale-110 transition-transform">
              {getProductEmoji(productId)}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-morph-green-500/10 to-morph-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-semibold line-clamp-2">{name}</CardTitle>
          <CardDescription className="text-xs line-clamp-2">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-morph-green-600">
              {formatUnits(price, 6)} USDC
            </span>
            <div className="flex items-center text-xs text-muted-foreground">
              <Zap className="h-3 w-3 mr-1 text-morph-green-500" />
              NFT
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              <User className="h-2 w-2 mr-1" />
              {formatAddress(creator)}
            </Badge>
            <Button size="sm" asChild>
              <Link to="/product/$id" params={{ id: productId.toString() }}>
                View
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}