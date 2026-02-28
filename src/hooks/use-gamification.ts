import { useAccount, useReadContract } from 'wagmi'
import { EXTENSION_CONTRACTS, GAMIFICATION_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function useGamification() {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.gamification !== ZERO

  const { data: userStats, isLoading: isLoadingStats } = useReadContract({
    address: EXTENSION_CONTRACTS.gamification,
    abi: GAMIFICATION_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address && enabled },
  })

  const { data: activeQuests, isLoading: isLoadingQuests } = useReadContract({
    address: EXTENSION_CONTRACTS.gamification,
    abi: GAMIFICATION_ABI,
    functionName: 'getActiveQuests',
    query: { enabled },
  })

  const { data: achievementCount } = useReadContract({
    address: EXTENSION_CONTRACTS.gamification,
    abi: GAMIFICATION_ABI,
    functionName: 'achievementCount',
    query: { enabled },
  })

  const { data: questCount } = useReadContract({
    address: EXTENSION_CONTRACTS.gamification,
    abi: GAMIFICATION_ABI,
    functionName: 'questCount',
    query: { enabled },
  })

  const parsedStats = userStats ? {
    totalXP: Number((userStats as any)[0] || 0),
    level: Number((userStats as any)[1] || 0),
    currentStreak: Number((userStats as any)[2] || 0),
    longestStreak: Number((userStats as any)[3] || 0),
    completedQuests: Number((userStats as any)[4] || 0),
    unlockedAchievements: Number((userStats as any)[5] || 0),
  } : undefined

  const parsedQuests = activeQuests ? {
    questIds: (activeQuests as any)[0] as bigint[],
    names: (activeQuests as any)[1] as string[],
    questTypes: (activeQuests as any)[2] as number[],
    xpRewards: (activeQuests as any)[3] as bigint[],
  } : undefined

  return {
    userStats: parsedStats,
    activeQuests: parsedQuests,
    achievementCount: achievementCount ? Number(achievementCount) : 0,
    questCount: questCount ? Number(questCount) : 0,
    isLoading: isLoadingStats || isLoadingQuests,
    contractDeployed: enabled,
  }
}

export function useQuestProgress(questId: bigint | undefined) {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.gamification !== ZERO

  const { data: progress, isLoading } = useReadContract({
    address: EXTENSION_CONTRACTS.gamification,
    abi: GAMIFICATION_ABI,
    functionName: 'getUserQuestProgress',
    args: address && questId !== undefined ? [address, questId] : undefined,
    query: { enabled: !!address && questId !== undefined && enabled },
  })

  const parsed = progress ? {
    currentProgress: Number((progress as any)[0] || 0),
    targetValue: Number((progress as any)[1] || 0),
    isCompleted: (progress as any)[2] as boolean,
    completionCount: Number((progress as any)[3] || 0),
  } : undefined

  return { progress: parsed, isLoading }
}
