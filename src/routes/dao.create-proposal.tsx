import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  FileText, 
  DollarSign, 
  Settings, 
  Users, 
  Zap, 
  AlertTriangle,
  Info,
  Plus,
  Trash2
} from 'lucide-react'

interface ProposalAction {
  target: string
  value: string
  calldata: string
  description: string
}

export const Route = createFileRoute('/dao/create-proposal')({
  component: CreateProposal,
})

function CreateProposal() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  
  const [proposalData, setProposalData] = useState({
    title: '',
    description: '',
    category: 'Treasury',
    requestedFunding: '',
    ipfsHash: '',
    detailedDescription: ''
  })

  const [actions, setActions] = useState<ProposalAction[]>([
    {
      target: '',
      value: '0',
      calldata: '0x',
      description: ''
    }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Mock voting power check
  const mockVotingPower = "125000" // 125K KUDO
  const proposalThreshold = "100000" // 100K KUDO required
  const hasEnoughPower = parseFloat(mockVotingPower) >= parseFloat(proposalThreshold)

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to create DAO proposals
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasEnoughPower) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Insufficient Voting Power</h2>
            <p className="text-muted-foreground mb-4">
              You need at least {(parseFloat(proposalThreshold) / 1000).toFixed(0)}K KUDO tokens to create proposals.
            </p>
            <p className="text-muted-foreground mb-6">
              Your current voting power: {(parseFloat(mockVotingPower) / 1000).toFixed(0)}K KUDO
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate({ to: '/dao/dashboard' })}>
                Back to DAO
              </Button>
              <Button variant="outline">
                Get More KUDO
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const addAction = () => {
    setActions([
      ...actions,
      {
        target: '',
        value: '0',
        calldata: '0x',
        description: ''
      }
    ])
  }

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index))
    }
  }

  const updateAction = (index: number, field: keyof ProposalAction, value: string) => {
    const updated = [...actions]
    updated[index] = { ...updated[index], [field]: value }
    setActions(updated)
  }

  const getProposalTemplate = (category: string) => {
    switch (category) {
      case 'Treasury':
        return {
          title: 'Treasury Funding Request: [Purpose]',
          description: 'This proposal requests [amount] KUDO from the treasury for [specific purpose]. The funding will be used to [detailed explanation of use]. Expected outcomes include [measurable benefits to the ecosystem].',
          target: '0x...', // Treasury contract address
          calldata: '0x...' // Transfer function call
        }
      case 'Protocol':
        return {
          title: 'Protocol Parameter Update: [Parameter Name]',
          description: 'This proposal updates the [parameter name] from [current value] to [new value]. This change will [explanation of impact]. The modification is necessary because [rationale].',
          target: '0x...', // Protocol contract address
          calldata: '0x...' // Parameter update function call
        }
      case 'Ecosystem':
        return {
          title: 'Ecosystem Partnership: [Partner Name]',
          description: 'This proposal establishes a partnership with [partner name] to [partnership objectives]. The collaboration will provide [benefits to KudoBit ecosystem]. Terms include [key partnership terms].',
          target: '0x...', // Partnership contract or multisig
          calldata: '0x...' // Partnership execution call
        }
      case 'Community':
        return {
          title: 'Community Program: [Program Name]',
          description: 'This proposal launches a new community program focused on [program focus]. The initiative will [program description] and is expected to [community benefits]. Budget allocation: [amount breakdown].',
          target: '0x...', // Community treasury or program contract
          calldata: '0x...' // Program initiation call
        }
      case 'Technical':
        return {
          title: 'Technical Improvement: [Feature/Fix Name]',
          description: 'This proposal implements [technical improvement] to address [problem/opportunity]. The changes include [technical details] and will result in [technical and user benefits].',
          target: '0x...', // Implementation contract
          calldata: '0x...' // Upgrade or fix implementation call
        }
      default:
        return {
          title: '',
          description: '',
          target: '',
          calldata: '0x'
        }
    }
  }

  const applyTemplate = () => {
    const template = getProposalTemplate(proposalData.category)
    setProposalData({
      ...proposalData,
      title: template.title,
      description: template.description
    })
    setActions([{
      target: template.target,
      value: '0',
      calldata: template.calldata,
      description: `Execute ${proposalData.category.toLowerCase()} proposal`
    }])
  }

  const validateForm = () => {
    if (!proposalData.title.trim()) {
      setError('Proposal title is required')
      return false
    }
    if (!proposalData.description.trim()) {
      setError('Proposal description is required')
      return false
    }
    if (proposalData.category === 'Treasury' && proposalData.requestedFunding) {
      const funding = parseFloat(proposalData.requestedFunding)
      if (funding > 1000000) {
        setError('Funding requests cannot exceed 1M KUDO tokens')
        return false
      }
    }
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      if (!action.target.trim()) {
        setError(`Action ${i + 1}: Target address is required`)
        return false
      }
      if (!action.description.trim()) {
        setError(`Action ${i + 1}: Description is required`)
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
      // In production, this would create the actual proposal on-chain
      console.log('Creating proposal:', {
        ...proposalData,
        actions,
        proposer: address
      })

      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Navigate back to DAO dashboard
      navigate({ to: '/dao/dashboard' })

    } catch (err) {
      console.error('Proposal creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create DAO Proposal</h1>
        <p className="text-muted-foreground">
          Submit a proposal for community voting and governance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Proposal Basics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Proposal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={proposalData.category} 
                  onValueChange={(value) => setProposalData({ ...proposalData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Treasury">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Treasury Management
                      </div>
                    </SelectItem>
                    <SelectItem value="Protocol">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Protocol Parameters
                      </div>
                    </SelectItem>
                    <SelectItem value="Ecosystem">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Ecosystem Partnerships
                      </div>
                    </SelectItem>
                    <SelectItem value="Community">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Community Programs
                      </div>
                    </SelectItem>
                    <SelectItem value="Technical">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Technical Improvements
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {proposalData.category === 'Treasury' && (
                <div>
                  <Label htmlFor="funding">Requested Funding (KUDO)</Label>
                  <Input
                    id="funding"
                    type="number"
                    min="0"
                    max="1000000"
                    value={proposalData.requestedFunding}
                    onChange={(e) => setProposalData({ ...proposalData, requestedFunding: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Maximum: 1M KUDO</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={applyTemplate}
              >
                Use Template
              </Button>
              <Info className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-muted-foreground">Apply category-specific template</span>
            </div>

            <div>
              <Label htmlFor="title">Proposal Title *</Label>
              <Input
                id="title"
                value={proposalData.title}
                onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                placeholder="Enter a clear, descriptive title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Summary Description *</Label>
              <textarea
                id="description"
                className="w-full p-3 border border-border rounded-md min-h-[120px]"
                value={proposalData.description}
                onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                placeholder="Provide a clear, concise summary of your proposal"
                required
              />
            </div>

            <div>
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <textarea
                id="detailedDescription"
                className="w-full p-3 border border-border rounded-md min-h-[200px]"
                value={proposalData.detailedDescription}
                onChange={(e) => setProposalData({ ...proposalData, detailedDescription: e.target.value })}
                placeholder="Provide detailed information about your proposal, including rationale, implementation details, expected outcomes, and any relevant background information"
              />
            </div>

            <div>
              <Label htmlFor="ipfs">IPFS Documentation Hash</Label>
              <Input
                id="ipfs"
                value={proposalData.ipfsHash}
                onChange={(e) => setProposalData({ ...proposalData, ipfsHash: e.target.value })}
                placeholder="QmXXX... (optional - for additional documentation)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload detailed documentation to IPFS for transparency
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Proposal Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Proposal Actions
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Define the on-chain actions that will be executed if this proposal passes.
            </p>

            {actions.map((action, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Action {index + 1}</h4>
                  {actions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAction(index)}
                      className="text-destructive hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Target Contract Address *</Label>
                    <Input
                      value={action.target}
                      onChange={(e) => updateAction(index, 'target', e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <Label>Action Description *</Label>
                    <Input
                      value={action.description}
                      onChange={(e) => updateAction(index, 'description', e.target.value)}
                      placeholder="Describe what this action does"
                      required
                    />
                  </div>

                  {showAdvanced && (
                    <>
                      <div>
                        <Label>ETH Value (wei)</Label>
                        <Input
                          value={action.value}
                          onChange={(e) => updateAction(index, 'value', e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label>Calldata</Label>
                        <textarea
                          className="w-full p-2 border border-border rounded-md font-mono text-xs"
                          value={action.calldata}
                          onChange={(e) => updateAction(index, 'calldata', e.target.value)}
                          placeholder="0x..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addAction}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Action
            </Button>
          </CardContent>
        </Card>

        {/* Voting Power Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Voting Power Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Your Voting Power</p>
                <p className="text-2xl font-bold text-primary">
                  {(parseFloat(mockVotingPower) / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Required Threshold</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {(parseFloat(proposalThreshold) / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-chart-1">
                  ✓ Eligible
                </p>
              </div>
            </div>
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
            disabled={isSubmitting}
            size="lg"
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Creating Proposal...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Create Proposal
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/dao/dashboard' })}
          >
            Cancel
          </Button>
        </div>

        <div className="bg-primary/5 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Proposal Process</p>
              <ul className="space-y-1 text-xs">
                <li>• Proposals have a 1-day delay before voting begins</li>
                <li>• Voting period lasts 7 days</li>
                <li>• Quorum requirement: 4% of total supply</li>
                <li>• Successful proposals are queued for 24-hour timelock</li>
                <li>• Anyone can execute after timelock expires</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}