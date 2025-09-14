import { createFileRoute, Link } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'

export const Route = createFileRoute('/creator/products')({
  component: CreatorProducts,
})

function CreatorProducts() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to access your products
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground">
            Manage your digital products
          </p>
        </div>
        <Link to="/creator/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Products
          </CardTitle>
          <CardDescription>
            Your digital products will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No products created yet. Create your first product to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}