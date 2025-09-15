import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

interface Product {
  name: string
  sales: number
  revenue: string
}

interface RecentProductsProps {
  products: Product[]
  loading: boolean
}

export function RecentProducts({ products, loading }: RecentProductsProps) {
  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-md border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Recent Products</h2>
          <p className="text-muted-foreground text-sm mt-1">Your latest product performance</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-muted rounded-lg mr-4 animate-pulse"></div>
                  <div>
                    <div className="w-32 h-4 bg-muted rounded mb-1 animate-pulse"></div>
                    <div className="w-20 h-3 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-4 bg-muted rounded mb-1 animate-pulse"></div>
                  <div className="w-12 h-3 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6">
            View All Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background rounded-2xl shadow-md border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Recent Products</h2>
        <p className="text-muted-foreground text-sm mt-1">Your latest product performance</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{product.name}</div>
                  <div className="text-sm text-muted-foreground">{product.sales} sales</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">{product.revenue}</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-6">
          View All Products
        </Button>
      </div>
    </div>
  )
}