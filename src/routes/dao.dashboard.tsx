import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  Vote, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Coins,
  BarChart3,
  Settings
} from 'lucide-react'

// Mock contract addresses - in production these would come from config
const DAO_CONTRACT = '0x...' // KudoBitDAO address
const GOVERNANCE_TOKEN = '0x...' // KudoBitGovernanceToken address

interface Proposal {
  id: number
  title: string
  description: string
  category: string
  proposer: string
  forVotes: string
  againstVotes: string
  abstainVotes: string
  status: 'Active' | 'Executed' | 'Defeated' | 'Pending' | 'Queued'
  endTime: number
  executionTime?: number
  requestedFunding?: string
}

interface GovernanceStats {
  totalProposals: number
  executedProposals: number
  currentQuorum: string
  averageParticipation: string
  treasuryBalance: string
  totalTokenSupply: string
  circulatingSupply: string
}

export const Route = createFileRoute('/dao/dashboard')({
  component: DAODashboard,
})

function DAODashboard() {
  const { address, isConnected } = useAccount()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState<GovernanceStats | null>(null)
  const [userVotingPower, setUserVotingPower] = useState('0')
  const [userTokenBalance, setUserTokenBalance] = useState('0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock data for demonstration
  const mockProposals: Proposal[] = [
    {
      id: 1,
      title: "Increase Creator Reward Pool by 500K KUDO",
      description: "Proposal to allocate additional 500,000 KUDO tokens to the creator reward pool to incentivize platform growth and creator retention.",
      category: "Treasury",
      proposer: "0x1234...5678",
      forVotes: "2450000",
      againstVotes: "180000",
      abstainVotes: "50000",
      status: "Active",
      endTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
      requestedFunding: "500000"
    },
    {
      id: 2,
      title: "Protocol Fee Reduction to 1.5%",
      description: "Reduce the protocol fee from 2.5% to 1.5% to improve creator profitability and platform competitiveness.",
      category: "Protocol",
      proposer: "0x9876...5432",
      forVotes: "1800000",
      againstVotes: "120000",
      abstainVotes: "30000",
      status: "Executed",
      endTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      executionTime: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 3,
      title: "Partnership with MorphL2 for Enhanced Integration",
      description: "Establish strategic partnership with MorphL2 for deeper protocol integration and co-marketing initiatives.",
      category: "Ecosystem",
      proposer: "0xABCD...EFGH",
      forVotes: "3200000",
      againstVotes: "45000",
      abstainVotes: "85000",
      status: "Queued",
      endTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      executionTime: Date.now() + 2 * 24 * 60 * 60 * 1000
    }
  ]

  const mockStats: GovernanceStats = {
    totalProposals: 15,
    executedProposals: 12,
    currentQuorum: "1250000", // 1.25M votes
    averageParticipation: "65.3",
    treasuryBalance: "8500000", // 8.5M KUDO
    totalTokenSupply: "45000000", // 45M KUDO
    circulatingSupply: "32000000" // 32M KUDO
  }

  useEffect(() => {
    if (isConnected && address) {
      loadDAOData()
    }
  }, [isConnected, address])

  const loadDAOData = async () => {
    try {
      // In production, these would be actual contract calls
      setProposals(mockProposals)
      setStats(mockStats)
      setUserVotingPower("125000") // Mock: 125K voting power
      setUserTokenBalance("250000") // Mock: 250K KUDO balance
      
    } catch (err) {
      console.error('DAO data loading error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load DAO data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(0)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default'
      case 'Executed': return 'default'
      case 'Defeated': return 'destructive'
      case 'Pending': return 'secondary'
      case 'Queued': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Vote className="w-4 h-4" />
      case 'Executed': return <CheckCircle className="w-4 h-4" />
      case 'Defeated': return <XCircle className="w-4 h-4" />
      case 'Queued': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to access the KudoBit DAO
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-border rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-border rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-border rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">KudoBit DAO</h1>
          <p className="text-muted-foreground">Decentralized governance for the creator economy</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dao/create-proposal">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Proposal
            </Button>
          </Link>
          <Link to="/dao/treasury">
            <Button variant="outline" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Treasury
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* User Governance Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Governance Power
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatNumber(userTokenBalance)}</p>
              <p className="text-sm text-muted-foreground">KUDO Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-1">{formatNumber(userVotingPower)}</p>
              <p className="text-sm text-muted-foreground">Voting Power</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-3">
                {stats ? ((parseFloat(userVotingPower) / parseFloat(stats.totalTokenSupply)) * 100).toFixed(2) : '0'}%
              </p>
              <p className="text-sm text-muted-foreground">Governance Share</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Proposals</p>
                  <p className="text-2xl font-bold">{stats.totalProposals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Executed</p>
                  <p className="text-2xl font-bold">{stats.executedProposals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participation</p>
                  <p className="text-2xl font-bold">{stats.averageParticipation}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-4/10 rounded-lg">
                  <Coins className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Treasury</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.treasuryBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Proposals */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-5 h-5" />
                Recent Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <div className="text-center py-8">
                  <Vote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No proposals yet</p>
                  <Link to="/dao/create-proposal">
                    <Button>Create First Proposal</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{proposal.title}</h4>
                            <Badge variant={getStatusColor(proposal.status)} className="flex items-center gap-1">
                              {getStatusIcon(proposal.status)}
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {proposal.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                            <Badge variant="outline" className="text-xs">
                              {proposal.category}
                            </Badge>
                            {proposal.requestedFunding && (
                              <span>Funding: {formatNumber(proposal.requestedFunding)} KUDO</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Voting Results */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-chart-1" />
                            <span>For: {formatNumber(proposal.forVotes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-destructive" />
                            <span>Against: {formatNumber(proposal.againstVotes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Abstain: {formatNumber(proposal.abstainVotes)}</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-border rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-l-full" 
                            style={{ 
                              width: `${(parseFloat(proposal.forVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) + parseFloat(proposal.abstainVotes))) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {proposal.status === 'Active' ? (
                            <span>Ends {formatDate(proposal.endTime)}</span>
                          ) : proposal.executionTime ? (
                            <span>Executed {formatDate(proposal.executionTime)}</span>
                          ) : (
                            <span>Ended {formatDate(proposal.endTime)}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/dao/proposals/${proposal.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                          {proposal.status === 'Active' && (
                            <Button size="sm">
                              Vote
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {proposals.length > 0 && (
                <div className="mt-6 text-center">
                  <Link to="/dao/proposals">
                    <Button variant="outline">View All Proposals</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token Info */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Token Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Supply</span>
                    <span className="font-medium">{formatNumber(stats.totalTokenSupply)} KUDO</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Circulating</span>
                    <span className="font-medium">{formatNumber(stats.circulatingSupply)} KUDO</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Quorum</span>
                    <span className="font-medium">{formatNumber(stats.currentQuorum)} votes</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Treasury Balance</span>
                    <span className="font-medium text-chart-1">{formatNumber(stats.treasuryBalance)} KUDO</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/dao/create-proposal">
                  <Button className="w-full flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Proposal
                  </Button>
                </Link>
                <Link to="/dao/delegate">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Delegate Votes
                  </Button>
                </Link>
                <Link to="/dao/analytics">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                </Link>
                <Link to="/dao/settings">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    DAO Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Governance Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-primary hover:underline">
                  📋 Governance Guide
                </a>
                <a href="#" className="block text-primary hover:underline">
                  💡 Proposal Templates
                </a>
                <a href="#" className="block text-primary hover:underline">
                  📊 Voting History
                </a>
                <a href="#" className="block text-primary hover:underline">
                  🏛️ Constitution
                </a>
                <a href="#" className="block text-primary hover:underline">
                  💬 Community Forum
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}