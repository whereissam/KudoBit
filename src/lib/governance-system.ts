// Advanced Governance System
// Enterprise-grade governance, voting, and proposal management

import { z } from 'zod'
import crypto from 'crypto'

// Governance Types
export interface GovernanceConfig {
  id: string
  organizationId: string
  name: string
  description: string
  rules: GovernanceRules
  tokenomics: TokenomicsConfig
  votingMechanisms: VotingMechanism[]
  committees: Committee[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GovernanceRules {
  proposalThreshold: number // Minimum tokens required to create proposal
  quorumThreshold: number // Minimum participation for valid vote
  votingPeriod: number // Voting duration in hours
  executionDelay: number // Delay before execution in hours
  vetoPeriod: number // Veto period in hours
  proposalTypes: ProposalType[]
  delegationEnabled: boolean
  quadraticVoting: boolean
  emergencyProtocols: EmergencyProtocol[]
}

export interface TokenomicsConfig {
  governanceToken: {
    name: string
    symbol: string
    totalSupply: number
    decimals: number
    contractAddress?: string
  }
  distribution: {
    founders: number
    team: number
    community: number
    treasury: number
    staking: number
  }
  stakingRewards: {
    enabled: boolean
    rate: number // Annual percentage
    lockPeriod: number // Days
    slashingConditions: SlashingCondition[]
  }
  inflation: {
    enabled: boolean
    rate: number // Annual percentage
    cap: number // Maximum total supply
  }
}

export interface VotingMechanism {
  id: string
  name: string
  type: 'simple' | 'quadratic' | 'ranked' | 'conviction' | 'liquid'
  description: string
  parameters: Record<string, any>
  applicableProposalTypes: string[]
}

export interface Committee {
  id: string
  name: string
  description: string
  members: CommitteeMember[]
  permissions: CommitteePermission[]
  votingRules: VotingRules
  isActive: boolean
  createdAt: string
}

export interface CommitteeMember {
  userId: string
  role: 'chair' | 'member' | 'secretary'
  votingPower: number
  joinedAt: string
  tenure?: {
    startDate: string
    endDate: string
  }
}

export interface CommitteePermission {
  action: string
  scope: string[]
  conditions?: Record<string, any>
}

export interface VotingRules {
  quorum: number
  majority: number
  allowAbstention: boolean
  allowDelegation: boolean
  secret: boolean
}

export interface Proposal {
  id: string
  organizationId: string
  title: string
  description: string
  type: ProposalType
  proposer: string
  committee?: string
  content: ProposalContent
  voting: VotingDetails
  status: ProposalStatus
  execution?: ExecutionDetails
  timeline: ProposalTimeline
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type ProposalType = 
  | 'constitutional'
  | 'budget'
  | 'parameter_change'
  | 'membership'
  | 'partnership'
  | 'upgrade'
  | 'emergency'
  | 'custom'

export interface ProposalContent {
  summary: string
  rationale: string
  implementation: string
  risks: string
  alternatives?: string
  resources?: {
    type: 'budget' | 'personnel' | 'technology'
    amount?: number
    description: string
  }[]
  attachments?: {
    name: string
    url: string
    type: string
  }[]
}

export interface VotingDetails {
  mechanism: string
  startTime: string
  endTime: string
  quorumRequired: number
  majorityRequired: number
  currentQuorum: number
  votes: Vote[]
  results?: VotingResults
}

export interface Vote {
  id: string
  voterId: string
  delegatedFrom?: string
  choice: VoteChoice
  weight: number
  reason?: string
  timestamp: string
  signature?: string
}

export type VoteChoice = 'for' | 'against' | 'abstain' | number[] // number[] for ranked voting

export interface VotingResults {
  totalVotes: number
  totalWeight: number
  quorumMet: boolean
  breakdown: {
    for: { votes: number, weight: number }
    against: { votes: number, weight: number }
    abstain: { votes: number, weight: number }
  }
  winner?: VoteChoice
  passed: boolean
}

export type ProposalStatus = 
  | 'draft'
  | 'submitted'
  | 'voting'
  | 'passed'
  | 'rejected'
  | 'executed'
  | 'cancelled'
  | 'expired'

export interface ExecutionDetails {
  scheduledAt?: string
  executedAt?: string
  executedBy?: string
  transactionHash?: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  error?: string
  results?: Record<string, any>
}

export interface ProposalTimeline {
  created: string
  submitted?: string
  votingStarted?: string
  votingEnded?: string
  executed?: string
  milestones: TimelineMilestone[]
}

export interface TimelineMilestone {
  type: string
  description: string
  timestamp: string
  actor?: string
}

export interface EmergencyProtocol {
  id: string
  name: string
  triggerConditions: string[]
  actions: EmergencyAction[]
  requiredSignatures: number
  executors: string[]
}

export interface EmergencyAction {
  type: 'pause' | 'upgrade' | 'migrate' | 'freeze' | 'custom'
  target: string
  parameters: Record<string, any>
}

export interface SlashingCondition {
  violation: string
  penalty: number // Percentage of stake
  duration: number // Penalty duration in days
}

export interface Delegation {
  id: string
  delegator: string
  delegate: string
  scope: string[] // Proposal types or committees
  weight: number
  expiresAt?: string
  createdAt: string
}

// Validation Schemas
const proposalSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  type: z.enum(['constitutional', 'budget', 'parameter_change', 'membership', 'partnership', 'upgrade', 'emergency', 'custom']),
  content: z.object({
    summary: z.string().min(50),
    rationale: z.string().min(100),
    implementation: z.string().min(50),
    risks: z.string().min(20)
  })
})

// Governance System Class
export class GovernanceSystem {
  private configs: Map<string, GovernanceConfig> = new Map()
  private proposals: Map<string, Proposal> = new Map()
  private delegations: Map<string, Delegation> = new Map()
  private committees: Map<string, Committee> = new Map()

  constructor() {
    this.initializeDefaultConfigs()
  }

  // Governance Configuration
  async createGovernance(data: Partial<GovernanceConfig>): Promise<GovernanceConfig> {
    const config: GovernanceConfig = {
      id: `gov_${crypto.randomUUID()}`,
      organizationId: data.organizationId!,
      name: data.name || 'Default Governance',
      description: data.description || 'Organization governance system',
      rules: data.rules || this.getDefaultRules(),
      tokenomics: data.tokenomics || this.getDefaultTokenomics(),
      votingMechanisms: data.votingMechanisms || this.getDefaultVotingMechanisms(),
      committees: data.committees || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.configs.set(config.id, config)
    return config
  }

  async updateGovernance(id: string, updates: Partial<GovernanceConfig>): Promise<GovernanceConfig> {
    const config = this.configs.get(id)
    if (!config) {
      throw new Error('Governance configuration not found')
    }

    const updated = {
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.configs.set(id, updated)
    return updated
  }

  async getGovernance(organizationId: string): Promise<GovernanceConfig | null> {
    return Array.from(this.configs.values())
      .find(config => config.organizationId === organizationId) || null
  }

  // Proposal Management
  async createProposal(data: {
    organizationId: string
    title: string
    description: string
    type: ProposalType
    proposer: string
    content: ProposalContent
    committee?: string
  }): Promise<Proposal> {
    const validated = proposalSchema.parse(data)
    const governance = await this.getGovernance(data.organizationId)
    
    if (!governance) {
      throw new Error('Governance not configured for organization')
    }

    // Check if proposer has enough tokens
    const proposerStake = await this.getStakeBalance(data.proposer)
    if (proposerStake < governance.rules.proposalThreshold) {
      throw new Error('Insufficient stake to create proposal')
    }

    const proposal: Proposal = {
      id: `prop_${crypto.randomUUID()}`,
      organizationId: data.organizationId,
      title: validated.title,
      description: validated.description,
      type: validated.type,
      proposer: data.proposer,
      committee: data.committee,
      content: validated.content,
      voting: {
        mechanism: this.selectVotingMechanism(governance, validated.type),
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h delay
        endTime: new Date(Date.now() + (24 + governance.rules.votingPeriod) * 60 * 60 * 1000).toISOString(),
        quorumRequired: governance.rules.quorumThreshold,
        majorityRequired: 50, // Default 50%
        currentQuorum: 0,
        votes: []
      },
      status: 'draft',
      timeline: {
        created: new Date().toISOString(),
        milestones: [{
          type: 'created',
          description: 'Proposal created',
          timestamp: new Date().toISOString(),
          actor: data.proposer
        }]
      },
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.proposals.set(proposal.id, proposal)
    return proposal
  }

  async submitProposal(proposalId: string, submitter: string): Promise<Proposal> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal) {
      throw new Error('Proposal not found')
    }

    if (proposal.proposer !== submitter) {
      throw new Error('Only proposer can submit proposal')
    }

    proposal.status = 'submitted'
    proposal.timeline.submitted = new Date().toISOString()
    proposal.timeline.milestones.push({
      type: 'submitted',
      description: 'Proposal submitted for voting',
      timestamp: new Date().toISOString(),
      actor: submitter
    })
    proposal.updatedAt = new Date().toISOString()

    // Start voting automatically if no committee review required
    if (!proposal.committee) {
      await this.startVoting(proposalId)
    }

    return proposal
  }

  async startVoting(proposalId: string): Promise<Proposal> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal) {
      throw new Error('Proposal not found')
    }

    proposal.status = 'voting'
    proposal.voting.startTime = new Date().toISOString()
    proposal.timeline.votingStarted = new Date().toISOString()
    proposal.timeline.milestones.push({
      type: 'voting_started',
      description: 'Voting period has begun',
      timestamp: new Date().toISOString()
    })
    proposal.updatedAt = new Date().toISOString()

    // Schedule voting end
    setTimeout(() => {
      this.endVoting(proposalId)
    }, parseInt(proposal.voting.endTime) - Date.now())

    return proposal
  }

  // Voting System
  async castVote(data: {
    proposalId: string
    voterId: string
    choice: VoteChoice
    weight?: number
    reason?: string
    delegatedFrom?: string
  }): Promise<Vote> {
    const proposal = this.proposals.get(data.proposalId)
    if (!proposal) {
      throw new Error('Proposal not found')
    }

    if (proposal.status !== 'voting') {
      throw new Error('Proposal is not in voting phase')
    }

    // Check if voter already voted
    const existingVote = proposal.voting.votes.find(v => v.voterId === data.voterId)
    if (existingVote) {
      throw new Error('Voter has already cast a vote')
    }

    // Calculate voting weight
    const voterStake = await this.getStakeBalance(data.voterId)
    const weight = data.weight || voterStake

    const vote: Vote = {
      id: `vote_${crypto.randomUUID()}`,
      voterId: data.voterId,
      delegatedFrom: data.delegatedFrom,
      choice: data.choice,
      weight,
      reason: data.reason,
      timestamp: new Date().toISOString()
    }

    proposal.voting.votes.push(vote)
    proposal.voting.currentQuorum = this.calculateQuorum(proposal.voting.votes)
    proposal.updatedAt = new Date().toISOString()

    return vote
  }

  async endVoting(proposalId: string): Promise<Proposal> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal) {
      throw new Error('Proposal not found')
    }

    const results = this.calculateVotingResults(proposal.voting.votes)
    proposal.voting.results = results
    proposal.voting.endTime = new Date().toISOString()
    proposal.timeline.votingEnded = new Date().toISOString()

    // Determine proposal outcome
    if (results.quorumMet && results.passed) {
      proposal.status = 'passed'
      proposal.timeline.milestones.push({
        type: 'passed',
        description: 'Proposal has passed',
        timestamp: new Date().toISOString()
      })

      // Schedule execution
      await this.scheduleExecution(proposalId)
    } else {
      proposal.status = 'rejected'
      proposal.timeline.milestones.push({
        type: 'rejected',
        description: results.quorumMet ? 'Proposal rejected by vote' : 'Proposal failed to reach quorum',
        timestamp: new Date().toISOString()
      })
    }

    proposal.updatedAt = new Date().toISOString()
    return proposal
  }

  private calculateVotingResults(votes: Vote[]): VotingResults {
    const breakdown = {
      for: { votes: 0, weight: 0 },
      against: { votes: 0, weight: 0 },
      abstain: { votes: 0, weight: 0 }
    }

    let totalVotes = 0
    let totalWeight = 0

    for (const vote of votes) {
      totalVotes++
      totalWeight += vote.weight

      if (vote.choice === 'for') {
        breakdown.for.votes++
        breakdown.for.weight += vote.weight
      } else if (vote.choice === 'against') {
        breakdown.against.votes++
        breakdown.against.weight += vote.weight
      } else {
        breakdown.abstain.votes++
        breakdown.abstain.weight += vote.weight
      }
    }

    const forPercentage = totalWeight > 0 ? (breakdown.for.weight / totalWeight) * 100 : 0
    const quorumMet = totalWeight >= 100 // Simplified quorum check
    const passed = forPercentage > 50

    return {
      totalVotes,
      totalWeight,
      quorumMet,
      breakdown,
      winner: passed ? 'for' : 'against',
      passed: quorumMet && passed
    }
  }

  // Delegation System
  async createDelegation(data: {
    delegator: string
    delegate: string
    scope: string[]
    weight: number
    expiresAt?: string
  }): Promise<Delegation> {
    const delegation: Delegation = {
      id: `del_${crypto.randomUUID()}`,
      delegator: data.delegator,
      delegate: data.delegate,
      scope: data.scope,
      weight: data.weight,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString()
    }

    this.delegations.set(delegation.id, delegation)
    return delegation
  }

  async revokeDelegation(delegationId: string, delegator: string): Promise<void> {
    const delegation = this.delegations.get(delegationId)
    if (!delegation || delegation.delegator !== delegator) {
      throw new Error('Delegation not found or access denied')
    }

    this.delegations.delete(delegationId)
  }

  // Committee Management
  async createCommittee(data: {
    governanceId: string
    name: string
    description: string
    members: CommitteeMember[]
    permissions: CommitteePermission[]
    votingRules: VotingRules
  }): Promise<Committee> {
    const committee: Committee = {
      id: `comm_${crypto.randomUUID()}`,
      name: data.name,
      description: data.description,
      members: data.members,
      permissions: data.permissions,
      votingRules: data.votingRules,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    this.committees.set(committee.id, committee)
    return committee
  }

  // Execution System
  private async scheduleExecution(proposalId: string): Promise<void> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal) return

    const governance = await this.getGovernance(proposal.organizationId)
    if (!governance) return

    const executionTime = Date.now() + (governance.rules.executionDelay * 60 * 60 * 1000)
    
    proposal.execution = {
      scheduledAt: new Date(executionTime).toISOString(),
      status: 'pending'
    }

    // Schedule execution
    setTimeout(() => {
      this.executeProposal(proposalId)
    }, governance.rules.executionDelay * 60 * 60 * 1000)
  }

  private async executeProposal(proposalId: string): Promise<void> {
    const proposal = this.proposals.get(proposalId)
    if (!proposal || !proposal.execution) return

    try {
      proposal.execution.status = 'executing'
      proposal.execution.executedAt = new Date().toISOString()

      // Execute proposal based on type
      const results = await this.performExecution(proposal)
      
      proposal.execution.status = 'completed'
      proposal.execution.results = results
      proposal.status = 'executed'
      proposal.timeline.executed = new Date().toISOString()
      proposal.timeline.milestones.push({
        type: 'executed',
        description: 'Proposal has been executed',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      proposal.execution.status = 'failed'
      proposal.execution.error = error instanceof Error ? error.message : 'Execution failed'
    }

    proposal.updatedAt = new Date().toISOString()
  }

  private async performExecution(proposal: Proposal): Promise<Record<string, any>> {
    // Simulate execution based on proposal type
    switch (proposal.type) {
      case 'budget':
        return { budgetAllocated: true, amount: 100000 }
      case 'parameter_change':
        return { parametersUpdated: true, changes: proposal.content }
      case 'membership':
        return { membershipUpdated: true }
      default:
        return { executed: true }
    }
  }

  // Utility Methods
  private async getStakeBalance(userId: string): Promise<number> {
    // Simulate stake balance lookup
    return Math.floor(Math.random() * 10000) + 1000
  }

  private calculateQuorum(votes: Vote[]): number {
    return votes.reduce((sum, vote) => sum + vote.weight, 0)
  }

  private selectVotingMechanism(governance: GovernanceConfig, proposalType: ProposalType): string {
    const mechanism = governance.votingMechanisms.find(m => 
      m.applicableProposalTypes.includes(proposalType) || m.applicableProposalTypes.includes('*')
    )
    return mechanism?.id || 'simple'
  }

  // Default Configurations
  private getDefaultRules(): GovernanceRules {
    return {
      proposalThreshold: 1000,
      quorumThreshold: 10000,
      votingPeriod: 168, // 7 days
      executionDelay: 48, // 2 days
      vetoPeriod: 24, // 1 day
      proposalTypes: ['constitutional', 'budget', 'parameter_change', 'membership', 'partnership'],
      delegationEnabled: true,
      quadraticVoting: false,
      emergencyProtocols: []
    }
  }

  private getDefaultTokenomics(): TokenomicsConfig {
    return {
      governanceToken: {
        name: 'KudoBit Governance Token',
        symbol: 'KBG',
        totalSupply: 1000000000,
        decimals: 18
      },
      distribution: {
        founders: 20,
        team: 15,
        community: 40,
        treasury: 20,
        staking: 5
      },
      stakingRewards: {
        enabled: true,
        rate: 8, // 8% APY
        lockPeriod: 30,
        slashingConditions: []
      },
      inflation: {
        enabled: true,
        rate: 2, // 2% annual
        cap: 2000000000
      }
    }
  }

  private getDefaultVotingMechanisms(): VotingMechanism[] {
    return [
      {
        id: 'simple',
        name: 'Simple Majority',
        type: 'simple',
        description: 'Standard one-token-one-vote system',
        parameters: {},
        applicableProposalTypes: ['*']
      },
      {
        id: 'quadratic',
        name: 'Quadratic Voting',
        type: 'quadratic',
        description: 'Vote weight scales quadratically with token holdings',
        parameters: { maxCredits: 100 },
        applicableProposalTypes: ['constitutional', 'parameter_change']
      }
    ]
  }

  private initializeDefaultConfigs(): void {
    // Initialize with default governance for testing
    const defaultConfig: GovernanceConfig = {
      id: 'gov_default',
      organizationId: 'org_default',
      name: 'Default Governance',
      description: 'Default governance configuration',
      rules: this.getDefaultRules(),
      tokenomics: this.getDefaultTokenomics(),
      votingMechanisms: this.getDefaultVotingMechanisms(),
      committees: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.configs.set(defaultConfig.id, defaultConfig)
  }

  // Analytics
  async getGovernanceAnalytics(organizationId: string): Promise<{
    totalProposals: number
    activeProposals: number
    passRate: number
    participationRate: number
    topVoters: { userId: string, votes: number }[]
    proposalsByType: Record<string, number>
  }> {
    const proposals = Array.from(this.proposals.values())
      .filter(p => p.organizationId === organizationId)

    const totalProposals = proposals.length
    const activeProposals = proposals.filter(p => p.status === 'voting').length
    const passedProposals = proposals.filter(p => p.status === 'passed' || p.status === 'executed').length
    const passRate = totalProposals > 0 ? (passedProposals / totalProposals) * 100 : 0

    return {
      totalProposals,
      activeProposals,
      passRate,
      participationRate: 75, // Mock data
      topVoters: [
        { userId: 'user1', votes: 25 },
        { userId: 'user2', votes: 20 },
        { userId: 'user3', votes: 18 }
      ],
      proposalsByType: {
        budget: proposals.filter(p => p.type === 'budget').length,
        parameter_change: proposals.filter(p => p.type === 'parameter_change').length,
        membership: proposals.filter(p => p.type === 'membership').length
      }
    }
  }
}

// Export singleton
export const governanceSystem = new GovernanceSystem()