import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, DAO_ABI, GOVERNANCE_TOKEN_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'
const daoEnabled = EXTENSION_CONTRACTS.dao !== ZERO
const govEnabled = EXTENSION_CONTRACTS.governanceToken !== ZERO

export function useDAO() {
  const { address } = useAccount()

  const { data: stats, isLoading: isLoadingStats } = useReadContract({
    address: EXTENSION_CONTRACTS.dao,
    abi: DAO_ABI,
    functionName: 'getDAOStats',
    query: { enabled: daoEnabled },
  })

  const { data: activeProposalIds, isLoading: isLoadingProposals } = useReadContract({
    address: EXTENSION_CONTRACTS.dao,
    abi: DAO_ABI,
    functionName: 'getActiveProposals',
    query: { enabled: daoEnabled },
  })

  const { data: votingPower } = useReadContract({
    address: EXTENSION_CONTRACTS.dao,
    abi: DAO_ABI,
    functionName: 'getVotingPower',
    args: address ? [address] : undefined,
    query: { enabled: !!address && daoEnabled },
  })

  const { data: tokenBalance } = useReadContract({
    address: EXTENSION_CONTRACTS.governanceToken,
    abi: GOVERNANCE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && govEnabled },
  })

  const { data: treasuryBalance } = useReadContract({
    address: EXTENSION_CONTRACTS.dao,
    abi: DAO_ABI,
    functionName: 'treasuryBalance',
    query: { enabled: daoEnabled },
  })

  const { data: proposalThreshold } = useReadContract({
    address: EXTENSION_CONTRACTS.dao,
    abi: DAO_ABI,
    functionName: 'PROPOSAL_THRESHOLD',
    query: { enabled: daoEnabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const castVote = (proposalId: bigint, support: number) => {
    writeContract({
      address: EXTENSION_CONTRACTS.dao,
      abi: DAO_ABI,
      functionName: 'castVote',
      args: [proposalId, support],
    })
  }

  const propose = (title: string, description: string, proposalType: bigint, target: `0x${string}`, value: bigint, callData: `0x${string}`) => {
    writeContract({
      address: EXTENSION_CONTRACTS.dao,
      abi: DAO_ABI,
      functionName: 'propose',
      args: [title, description, proposalType, target, value, callData],
    })
  }

  const fundTreasury = (value: bigint) => {
    writeContract({
      address: EXTENSION_CONTRACTS.dao,
      abi: DAO_ABI,
      functionName: 'fundTreasury',
      value,
    })
  }

  const daoStats = stats ? {
    totalProposals: Number((stats as any)[0] || 0),
    activeProposals: Number((stats as any)[1] || 0),
    executedProposals: Number((stats as any)[2] || 0),
    treasury: (stats as any)[3] as bigint,
    totalSupply: (stats as any)[4] as bigint,
    quorumThreshold: Number((stats as any)[5] || 0),
  } : undefined

  return {
    daoStats,
    activeProposalIds: activeProposalIds as bigint[] | undefined,
    votingPower: votingPower as bigint | undefined,
    tokenBalance: tokenBalance as bigint | undefined,
    treasuryBalance: treasuryBalance as bigint | undefined,
    proposalThreshold: proposalThreshold as bigint | undefined,
    isLoading: isLoadingStats || isLoadingProposals,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    castVote,
    propose,
    fundTreasury,
  }
}

export function useProposal(proposalId: bigint | undefined) {
  const { address } = useAccount()

  const { data: proposal, isLoading } = useReadContract({
    address: EXTENSION_CONTRACTS.dao,
    abi: DAO_ABI,
    functionName: 'getProposal',
    args: proposalId !== undefined ? [proposalId] : undefined,
    query: { enabled: proposalId !== undefined && daoEnabled },
  })

  const { data: vote } = useReadContract({
    address: EXTENSION_CONTRACTS.dao,
    abi: DAO_ABI,
    functionName: 'getVote',
    args: proposalId !== undefined && address ? [proposalId, address] : undefined,
    query: { enabled: proposalId !== undefined && !!address && daoEnabled },
  })

  const parsed = proposal ? {
    id: Number((proposal as any)[0]),
    proposer: (proposal as any)[1] as string,
    title: (proposal as any)[2] as string,
    description: (proposal as any)[3] as string,
    proposalType: Number((proposal as any)[4]),
    startTime: Number((proposal as any)[5]),
    endTime: Number((proposal as any)[6]),
    forVotes: (proposal as any)[7] as bigint,
    againstVotes: (proposal as any)[8] as bigint,
    abstainVotes: (proposal as any)[9] as bigint,
    executed: (proposal as any)[10] as boolean,
    cancelled: (proposal as any)[11] as boolean,
  } : undefined

  const userVote = vote ? {
    hasVoted: (vote as any)[0] as boolean,
    support: Number((vote as any)[1]),
    weight: (vote as any)[2] as bigint,
    reason: (vote as any)[3] as string,
  } : undefined

  return { proposal: parsed, userVote, isLoading }
}
