import { createFileRoute, Link } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { useDAO } from '@/hooks/use-dao'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export const Route = createFileRoute('/dao/dashboard')({
  component: DAODashboard,
})

function DAODashboard() {
  const { address, isConnected } = useAccount()
  const {
    daoStats,
    votingPower,
    tokenBalance,
    treasuryBalance,
    isLoading: loading,
    castVote,
    isWriting,
  } = useDAO()

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
              <p className="text-2xl font-bold text-primary">{tokenBalance ? formatNumber(formatUnits(tokenBalance, 18)) : '0'}</p>
              <p className="text-sm text-muted-foreground">KUDO Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-1">{votingPower ? formatNumber(formatUnits(votingPower, 18)) : '0'}</p>
              <p className="text-sm text-muted-foreground">Voting Power</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-3">
                {votingPower && daoStats?.totalSupply && daoStats.totalSupply > 0n
                  ? ((Number(votingPower) / Number(daoStats.totalSupply)) * 100).toFixed(2)
                  : '0'}%
              </p>
              <p className="text-sm text-muted-foreground">Governance Share</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance Statistics */}
      {daoStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Proposals</p>
                  <p className="text-2xl font-bold">{daoStats.totalProposals}</p>
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
                  <p className="text-2xl font-bold">{daoStats.executedProposals}</p>
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
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{daoStats.activeProposals}</p>
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
                  <p className="text-2xl font-bold">{treasuryBalance ? formatNumber(formatUnits(treasuryBalance, 18)) : '0'} ETH</p>
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
              {!daoStats || daoStats.totalProposals === 0 ? (
                <div className="text-center py-8">
                  <Vote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No proposals yet</p>
                  <Link to="/dao/create-proposal">
                    <Button>Create First Proposal</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-6 border border-dashed border-border rounded-lg">
                    <p className="text-lg font-medium mb-1">{daoStats.totalProposals} proposal{daoStats.totalProposals !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {daoStats.activeProposals} active, {daoStats.executedProposals} executed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Proposal details load from on-chain data when contracts are deployed.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token Info */}
          {daoStats && (
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
                    <span className="font-medium">{daoStats.totalSupply ? formatNumber(formatUnits(daoStats.totalSupply, 18)) : '0'} KUDO</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Quorum Threshold</span>
                    <span className="font-medium">{formatNumber(daoStats.quorumThreshold)} votes</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Treasury Balance</span>
                    <span className="font-medium text-chart-1">{treasuryBalance ? formatNumber(formatUnits(treasuryBalance, 18)) : '0'} ETH</span>
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
                <Link to="/dao/treasury">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Treasury
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