import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Clock,
  FileText,
  Download,
  Calendar
} from 'lucide-react'

interface TreasuryTransaction {
  id: string
  type: 'inflow' | 'outflow'
  amount: string
  token: string
  description: string
  proposalId?: number
  timestamp: number
  txHash: string
  category: string
}

interface TreasuryAllocation {
  category: string
  amount: string
  percentage: number
  color: string
}

interface TreasuryStats {
  totalBalance: string
  monthlyInflow: string
  monthlyOutflow: string
  netChange: string
  proposalsExecuted: number
  avgProposalValue: string
}

export const Route = createFileRoute('/dao/treasury')({
  component: TreasuryDashboard,
})

function TreasuryDashboard() {
  const { address, isConnected } = useAccount()
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([])
  const [allocations, setAllocations] = useState<TreasuryAllocation[]>([])
  const [stats, setStats] = useState<TreasuryStats | null>(null)
  const [timeframe, setTimeframe] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock treasury data
  const mockTransactions: TreasuryTransaction[] = [
    {
      id: '1',
      type: 'outflow',
      amount: '500000',
      token: 'KUDO',
      description: 'Creator Reward Pool Allocation',
      proposalId: 1,
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      txHash: '0x1234...5678',
      category: 'Community Rewards'
    },
    {
      id: '2',
      type: 'inflow',
      amount: '750000',
      token: 'KUDO',
      description: 'Protocol Fees Collection',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      txHash: '0x2345...6789',
      category: 'Protocol Revenue'
    },
    {
      id: '3',
      type: 'outflow',
      amount: '250000',
      token: 'KUDO',
      description: 'Development Grant Payment',
      proposalId: 2,
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      txHash: '0x3456...7890',
      category: 'Development'
    },
    {
      id: '4',
      type: 'inflow',
      amount: '1200000',
      token: 'KUDO',
      description: 'Partnership Revenue Share',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      txHash: '0x4567...8901',
      category: 'Partnerships'
    },
    {
      id: '5',
      type: 'outflow',
      amount: '300000',
      token: 'KUDO',
      description: 'Marketing Campaign Budget',
      proposalId: 3,
      timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
      txHash: '0x5678...9012',
      category: 'Marketing'
    }
  ]

  const mockAllocations: TreasuryAllocation[] = [
    {
      category: 'Reserved Funds',
      amount: '6500000',
      percentage: 65,
      color: 'bg-primary/50'
    },
    {
      category: 'Community Rewards',
      amount: '1500000',
      percentage: 15,
      color: 'bg-green-500'
    },
    {
      category: 'Development',
      amount: '1000000',
      percentage: 10,
      color: 'bg-purple-500'
    },
    {
      category: 'Marketing',
      amount: '500000',
      percentage: 5,
      color: 'bg-orange-500'
    },
    {
      category: 'Operations',
      amount: '500000',
      percentage: 5,
      color: 'bg-red-500'
    }
  ]

  const mockStats: TreasuryStats = {
    totalBalance: '10000000',
    monthlyInflow: '2100000',
    monthlyOutflow: '1350000',
    netChange: '750000',
    proposalsExecuted: 12,
    avgProposalValue: '416667'
  }

  useEffect(() => {
    loadTreasuryData()
  }, [timeframe])

  const loadTreasuryData = async () => {
    try {
      // In production, fetch from actual contracts and APIs
      setTransactions(mockTransactions)
      setAllocations(mockAllocations)
      setStats(mockStats)
    } catch (err) {
      console.error('Treasury data loading error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load treasury data')
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view treasury information
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
          <h1 className="text-3xl font-bold mb-2">DAO Treasury</h1>
          <p className="text-muted-foreground">Transparent fund management and allocation</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Treasury Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalBalance)} KUDO</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Inflow</p>
                  <p className="text-2xl font-bold text-chart-1">+{formatNumber(stats.monthlyInflow)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Outflow</p>
                  <p className="text-2xl font-bold text-destructive">-{formatNumber(stats.monthlyOutflow)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <FileText className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Change</p>
                  <p className={`text-2xl font-bold ${parseFloat(stats.netChange) >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                    {parseFloat(stats.netChange) >= 0 ? '+' : ''}{formatNumber(stats.netChange)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fund Allocation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Fund Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocations.map((allocation, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${allocation.color}`}></div>
                      <span className="text-sm font-medium">{allocation.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatNumber(allocation.amount)} KUDO</p>
                      <p className="text-xs text-muted-foreground">{allocation.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Allocation Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Available for Proposals:</span>
                    <span className="font-medium">3.5M KUDO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserved/Locked:</span>
                    <span className="font-medium">6.5M KUDO</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">10M KUDO</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            tx.type === 'inflow' 
                              ? 'bg-chart-1/10 text-chart-1' 
                              : 'bg-red-100 text-destructive'
                          }`}>
                            {tx.type === 'inflow' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{tx.description}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {tx.category}
                              </Badge>
                              {tx.proposalId && (
                                <Link to={`/dao/proposals/${tx.proposalId}`}>
                                  <Badge variant="outline" className="text-xs hover:bg-muted">
                                    Proposal #{tx.proposalId}
                                  </Badge>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-bold ${
                            tx.type === 'inflow' ? 'text-chart-1' : 'text-destructive'
                          }`}>
                            {tx.type === 'inflow' ? '+' : '-'}{formatNumber(tx.amount)} {tx.token}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatTime(tx.timestamp)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Transaction: {tx.txHash}</span>
                        <a 
                          href={`https://explorer-holesky.morphl2.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View on Explorer ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {transactions.length > 0 && (
                <div className="mt-6 text-center">
                  <Button variant="outline">Load More Transactions</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Treasury Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Governance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Governance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Proposals Executed:</span>
                  <span className="font-bold">{stats.proposalsExecuted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Proposal Value:</span>
                  <span className="font-bold">{formatNumber(stats.avgProposalValue)} KUDO</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-bold text-chart-1">80%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Execution Time:</span>
                  <span className="font-bold">2.5 days</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Treasury Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/dao/create-proposal">
                <Button className="w-full flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Request Treasury Funding
                </Button>
              </Link>
              <Link to="/dao/proposals">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  View Active Proposals
                </Button>
              </Link>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Treasury Report
              </Button>
              <Link to="/dao/analytics">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Financial Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transparency Notice */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-2">Treasury Transparency</h3>
              <p className="text-sm text-muted-foreground mb-4">
                All treasury transactions are recorded on-chain and publicly verifiable. 
                Funds can only be moved through successful DAO proposals with community approval.
              </p>
              <div className="flex gap-4 text-sm">
                <a href="#" className="text-primary hover:underline">
                  📊 View Full Financial Reports
                </a>
                <a href="#" className="text-primary hover:underline">
                  🔍 Audit Trail
                </a>
                <a href="#" className="text-primary hover:underline">
                  📋 Treasury Policies
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}