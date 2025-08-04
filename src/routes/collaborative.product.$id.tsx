import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  Users, 
  DollarSign, 
  Package, 
  Vote,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react'

interface Collaborator {
  id: number
  wallet_address: string
  contribution_weight: number
  role: string
  is_active: boolean
}

interface RoyaltyRecipient {
  id: number
  recipient_address: string
  percentage: number
  role: string
}

interface CollaborativeProduct {
  id: number
  productId: number
  name: string
  description: string
  priceUsdc: string
  ipfsContentHash: string
  loyaltyBadgeId: number
  isActive: boolean
  requiresAllApproval: boolean
  totalSales: string
  createdAt: string
  collaborators: Collaborator[]
  royaltyRecipients: RoyaltyRecipient[]
}

interface Proposal {
  id: number
  productId: number
  proposalType: string
  proposer: string
  newPrice: string
  newActiveStatus: boolean
  votesFor: number
  votesAgainst: number
  executed: boolean
  deadline: string
  createdAt: string
}

export const Route = createFileRoute('/collaborative/product/$id')({
  component: CollaborativeProductDetail,
})

function CollaborativeProductDetail() {
  const { id } = useParams({ from: '/collaborative/product/$id' })
  const { address, isConnected } = useAccount()
  
  const [product, setProduct] = useState<CollaborativeProduct | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // New proposal form
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposalData, setProposalData] = useState({
    type: 'update_price',
    newPrice: '',
    newActiveStatus: true
  })
  const [submittingProposal, setSubmittingProposal] = useState(false)

  useEffect(() => {
    if (isConnected && address && id) {
      fetchProductData()
      fetchProposals()
    }
  }, [isConnected, address, id])

  const fetchProductData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/collaborative/products/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }

      const data = await response.json()
      setProduct(data.product)
    } catch (err) {
      console.error('Fetch product error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load product')
    }
  }

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`/api/collaborative/products/${id}/proposals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals)
      }
    } catch (err) {
      console.error('Fetch proposals error:', err)
    } finally {
      setLoading(false)
    }
  }

  const isCollaborator = () => {
    return product?.collaborators.some(collab => 
      collab.wallet_address.toLowerCase() === address?.toLowerCase()
    )
  }

  const formatPrice = (price: string | number) => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price
    return (priceNum / 1000000).toFixed(6)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingProposal(true)

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const requestData = {
        productId: parseInt(id),
        proposalType: proposalData.type,
        newPrice: proposalData.type === 'update_price' ? 
          parseFloat(proposalData.newPrice) * 1000000 : undefined,
        newActiveStatus: proposalData.type === 'activate' ? true :
          proposalData.type === 'deactivate' ? false : undefined
      }

      const response = await fetch('/api/collaborative/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create proposal')
      }

      // Refresh proposals
      await fetchProposals()
      setShowProposalForm(false)
      setProposalData({ type: 'update_price', newPrice: '', newActiveStatus: true })

    } catch (err) {
      console.error('Submit proposal error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create proposal')
    } finally {
      setSubmittingProposal(false)
    }
  }

  const handleVote = async (proposalId: number, support: boolean) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/collaborative/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ support })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to vote')
      }

      // Refresh proposals
      await fetchProposals()

    } catch (err) {
      console.error('Vote error:', err)
      setError(err instanceof Error ? err.message : 'Failed to vote')
    }
  }

  const handleExecuteProposal = async (proposalId: number) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/collaborative/proposals/${proposalId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to execute proposal')
      }

      // Refresh data
      await fetchProposals()
      await fetchProductData()

    } catch (err) {
      console.error('Execute proposal error:', err)
      setError(err instanceof Error ? err.message : 'Failed to execute proposal')
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to view product details</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-border rounded w-1/2"></div>
          <div className="h-64 bg-border rounded"></div>
          <div className="h-64 bg-border rounded"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested collaborative product could not be found.</p>
            <Link to="/collaborative/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Badge variant={product.isActive ? "default" : "secondary"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
            <span>Created {formatDate(product.createdAt)}</span>
            <span>${formatPrice(product.priceUsdc)} USDC</span>
          </div>
        </div>
        
        {isCollaborator() && (
          <div className="flex items-center gap-2">
            <Link to={`/collaborative/products/${id}/analytics`}>
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
            <Button 
              onClick={() => setShowProposalForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Proposal
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-foreground">
                  {product.description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <p className="text-xl font-bold">${formatPrice(product.priceUsdc)} USDC</p>
                </div>
                <div>
                  <Label>Total Sales</Label>
                  <p className="text-xl font-bold text-chart-1">
                    ${formatPrice(product.totalSales)}
                  </p>
                </div>
              </div>

              <div>
                <Label>Governance</Label>
                <p className="text-sm text-muted-foreground">
                  {product.requiresAllApproval 
                    ? "Requires unanimous approval for changes"
                    : "Simple majority voting"
                  }
                </p>
              </div>

              {product.ipfsContentHash && (
                <div>
                  <Label>Content Hash</Label>
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {product.ipfsContentHash}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Collaborators ({product.collaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {product.collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {collaborator.wallet_address.slice(0, 6)}...{collaborator.wallet_address.slice(-4)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {collaborator.role}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {(collaborator.contribution_weight / 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-5 h-5" />
                Governance Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="text-center py-8">
                  <Vote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No proposals yet</p>
                  {isCollaborator() && (
                    <Button 
                      className="mt-4"
                      onClick={() => setShowProposalForm(true)}
                    >
                      Create First Proposal
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium capitalize">
                            {proposal.proposalType.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                          </p>
                        </div>
                        <Badge variant={proposal.executed ? "default" : "secondary"}>
                          {proposal.executed ? "Executed" : "Active"}
                        </Badge>
                      </div>

                      {proposal.proposalType === 'update_price' && proposal.newPrice && (
                        <p className="text-sm mb-3">
                          New price: <strong>${formatPrice(proposal.newPrice)} USDC</strong>
                        </p>
                      )}

                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-chart-1" />
                          <span>{proposal.votesFor} For</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span>{proposal.votesAgainst} Against</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Until {formatDate(proposal.deadline)}</span>
                        </div>
                      </div>

                      {!proposal.executed && isCollaborator() && new Date() < new Date(proposal.deadline) && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleVote(proposal.id, true)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Vote For
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleVote(proposal.id, false)}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Vote Against
                          </Button>
                        </div>
                      )}

                      {!proposal.executed && isCollaborator() && (
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleExecuteProposal(proposal.id)}
                          >
                            Execute Proposal
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Proposal Modal */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <Label htmlFor="proposalType">Proposal Type</Label>
                  <Select 
                    value={proposalData.type} 
                    onValueChange={(value) => setProposalData({ ...proposalData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update_price">Update Price</SelectItem>
                      <SelectItem value="activate">Activate Product</SelectItem>
                      <SelectItem value="deactivate">Deactivate Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {proposalData.type === 'update_price' && (
                  <div>
                    <Label htmlFor="newPrice">New Price (USDC)</Label>
                    <Input
                      id="newPrice"
                      type="number"
                      step="0.000001"
                      min="0"
                      value={proposalData.newPrice}
                      onChange={(e) => setProposalData({ ...proposalData, newPrice: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <Button type="submit" disabled={submittingProposal}>
                    {submittingProposal ? 'Creating...' : 'Create Proposal'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowProposalForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}