import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Trash2, Plus, Users, Coins, FileText, Settings } from 'lucide-react'

interface Collaborator {
  wallet: string
  contributionWeight: number
  role: string
}

export const Route = createFileRoute('/collaborative/create')({
  component: CreateCollaborativeProduct,
})

function CreateCollaborativeProduct() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    priceUsdc: '',
    ipfsContentHash: '',
    loyaltyBadgeId: 1
  })

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      wallet: address || '',
      contributionWeight: 5000, // 50%
      role: 'Creator'
    }
  ])

  const [requiresAllApproval, setRequiresAllApproval] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to create collaborative products
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const addCollaborator = () => {
    setCollaborators([
      ...collaborators,
      {
        wallet: '',
        contributionWeight: 1000, // 10%
        role: 'Collaborator'
      }
    ])
  }

  const removeCollaborator = (index: number) => {
    if (collaborators.length <= 2) {
      setError('Minimum 2 collaborators required')
      return
    }
    setCollaborators(collaborators.filter((_, i) => i !== index))
  }

  const updateCollaborator = (index: number, field: keyof Collaborator, value: string | number) => {
    const updated = [...collaborators]
    updated[index] = { ...updated[index], [field]: value }
    setCollaborators(updated)
  }

  const getTotalWeight = () => {
    return collaborators.reduce((sum, collab) => sum + collab.contributionWeight, 0)
  }

  const isValidWeights = () => {
    return getTotalWeight() === 10000
  }

  const validateForm = () => {
    if (!productData.name.trim()) {
      setError('Product name is required')
      return false
    }
    if (!productData.priceUsdc || parseFloat(productData.priceUsdc) <= 0) {
      setError('Valid price is required')
      return false
    }
    if (collaborators.length < 2) {
      setError('Minimum 2 collaborators required')
      return false
    }
    if (!isValidWeights()) {
      setError('Contribution weights must total exactly 100%')
      return false
    }
    for (const collab of collaborators) {
      if (!collab.wallet.trim()) {
        setError('All collaborator wallet addresses are required')
        return false
      }
      if (!collab.role.trim()) {
        setError('All collaborator roles are required')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      // Generate a unique product ID (in production, this might come from the backend)
      const productId = Date.now()

      const requestData = {
        productId,
        name: productData.name,
        description: productData.description,
        priceUsdc: parseFloat(productData.priceUsdc) * 1000000, // Convert to 6 decimal places
        ipfsContentHash: productData.ipfsContentHash || null,
        loyaltyBadgeId: productData.loyaltyBadgeId,
        collaborators: collaborators.map(collab => ({
          wallet: collab.wallet.trim(),
          contributionWeight: collab.contributionWeight,
          role: collab.role.trim()
        })),
        requiresAllApproval
      }

      const response = await fetch('/api/collaborative/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      // Navigate to the collaborative dashboard
      navigate({ to: '/collaborative/dashboard' })

    } catch (err) {
      console.error('Create collaborative product error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Collaborative Product</h1>
        <p className="text-muted-foreground">
          Set up a product with multiple creators and automatic revenue sharing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full p-3 border border-border rounded-md min-h-[100px]"
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                placeholder="Describe your collaborative product"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (USDC) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.000001"
                  min="0"
                  value={productData.priceUsdc}
                  onChange={(e) => setProductData({ ...productData, priceUsdc: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="badge">Loyalty Badge Tier</Label>
                <Select 
                  value={productData.loyaltyBadgeId.toString()} 
                  onValueChange={(value) => setProductData({ ...productData, loyaltyBadgeId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">🥉 Bronze Badge</SelectItem>
                    <SelectItem value="2">🥈 Silver Badge</SelectItem>
                    <SelectItem value="3">🥇 Gold Badge</SelectItem>
                    <SelectItem value="4">💎 Diamond Badge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ipfs">IPFS Content Hash (Optional)</Label>
              <Input
                id="ipfs"
                value={productData.ipfsContentHash}
                onChange={(e) => setProductData({ ...productData, ipfsContentHash: e.target.value })}
                placeholder="Qm... (IPFS hash for digital content)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Collaborators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Collaborators ({collaborators.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {collaborators.map((collaborator, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Collaborator {index + 1}</h4>
                  {collaborators.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCollaborator(index)}
                      className="text-destructive hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Wallet Address *</Label>
                    <Input
                      value={collaborator.wallet}
                      onChange={(e) => updateCollaborator(index, 'wallet', e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Role *</Label>
                    <Input
                      value={collaborator.role}
                      onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                      placeholder="e.g., Artist, Writer, Promoter"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Revenue Share (%) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={collaborator.contributionWeight / 100}
                        onChange={(e) => updateCollaborator(index, 'contributionWeight', Math.round(parseFloat(e.target.value || '0') * 100))}
                        placeholder="50"
                        required
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={addCollaborator}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Collaborator
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total:</span>
                <Badge variant={isValidWeights() ? "default" : "destructive"}>
                  {(getTotalWeight() / 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            {!isValidWeights() && (
              <p className="text-sm text-destructive">
                ⚠️ Revenue shares must total exactly 100%. Currently: {(getTotalWeight() / 100).toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>

        {/* Governance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Governance Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requiresApproval"
                checked={requiresAllApproval}
                onChange={(e) => setRequiresAllApproval(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="requiresApproval" className="cursor-pointer">
                Require unanimous approval for product changes
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {requiresAllApproval 
                ? "All collaborators must approve changes to price, status, etc."
                : "Simple majority vote required for changes"
              }
            </p>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !isValidWeights()}
            size="lg"
            className="flex items-center gap-2"
          >
            <Coins className="w-4 h-4" />
            {isSubmitting ? 'Creating Product...' : 'Create Collaborative Product'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/collaborative/dashboard' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}