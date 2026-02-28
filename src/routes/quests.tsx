import { createFileRoute } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { useGamification } from '@/hooks/use-gamification'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Flame, 
  Crown,
  Gift,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Lock,
  CheckCircle,
  Clock,
  Coins
} from 'lucide-react'

interface Quest {
  id: string
  name: string
  description: string
  type: 'purchase' | 'spend' | 'daily' | 'social' | 'creator' | 'community'
  targetValue: number
  currentProgress: number
  xpReward: number
  tokenReward: number
  badgeReward?: number
  timeLimit?: number
  isCompleted: boolean
  isRepeatable: boolean
  completionCount: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: 'milestone' | 'streak' | 'rare' | 'special'
  requiredValue: number
  currentProgress: number
  xpReward: number
  badgeReward?: number
  isUnlocked: boolean
  isSecret: boolean
  unlockedAt?: number
}

interface UserStats {
  totalXP: number
  level: number
  currentStreak: number
  longestStreak: number
  completedQuests: number
  unlockedAchievements: number
  rank: number
}

interface LeaderboardEntry {
  rank: number
  address: string
  displayName: string
  score: number
  avatar?: string
}

function QuestsPage() {
  const { address, isConnected } = useAccount()
  const {
    userStats: contractStats,
    activeQuests: contractQuests,
    achievementCount,
    questCount,
    isLoading: loading,
    contractDeployed,
  } = useGamification()

  const userStats: UserStats = contractStats
    ? { ...contractStats, rank: 0 }
    : { totalXP: 0, level: 0, currentStreak: 0, longestStreak: 0, completedQuests: 0, unlockedAchievements: 0, rank: 0 }

  // Build quest list from contract data
  const questTypeMap = ['purchase', 'spend', 'daily', 'social', 'creator', 'community'] as const
  const activeQuests: Quest[] = contractQuests
    ? contractQuests.questIds.map((id, i) => ({
        id: id.toString(),
        name: contractQuests.names[i] || `Quest #${id}`,
        description: '',
        type: questTypeMap[contractQuests.questTypes[i]] || 'daily',
        targetValue: 1,
        currentProgress: 0,
        xpReward: Number(contractQuests.xpRewards[i] || 0),
        tokenReward: 0,
        isCompleted: false,
        isRepeatable: false,
        completionCount: 0,
      }))
    : []

  // Achievements and leaderboards need indexer data — empty for now
  const achievements: Achievement[] = []
  const leaderboards: { xp: LeaderboardEntry[]; streak: LeaderboardEntry[]; quests: LeaderboardEntry[] } = {
    xp: [], streak: [], quests: [],
  }

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-5 w-5" />
      case 'purchase': return <Coins className="h-5 w-5" />
      case 'spend': return <TrendingUp className="h-5 w-5" />
      case 'social': return <Users className="h-5 w-5" />
      case 'creator': return <Crown className="h-5 w-5" />
      case 'community': return <Users className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-primary/10 text-primary'
      case 'purchase': return 'bg-chart-2/10 text-chart-2'
      case 'spend': return 'bg-chart-3/10 text-chart-3'
      case 'social': return 'bg-chart-4/10 text-chart-4'
      case 'creator': return 'bg-chart-3/10 text-chart-3'
      case 'community': return 'bg-chart-5/10 text-chart-5'
      default: return 'bg-muted/30 text-muted-foreground'
    }
  }

  const getXPToNextLevel = (currentXP: number, level: number) => {
    const levelThresholds = [1000, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000]
    if (level >= levelThresholds.length) return 0
    return levelThresholds[level] - currentXP
  }

  const getProgressToNextLevel = (currentXP: number, level: number) => {
    const levelThresholds = [1000, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000]
    if (level >= levelThresholds.length) return 100
    if (level === 0) return (currentXP / levelThresholds[0]) * 100
    
    const prevThreshold = levelThresholds[level - 1] || 0
    const nextThreshold = levelThresholds[level]
    return ((currentXP - prevThreshold) / (nextThreshold - prevThreshold)) * 100
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view quests and achievements.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted/50 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 bg-muted/50 rounded-lg"></div>
            <div className="h-48 bg-muted/50 rounded-lg"></div>
            <div className="h-48 bg-muted/50 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Quests & Achievements</h1>
        <p className="text-muted-foreground">Complete quests and unlock achievements to earn rewards</p>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
                <div className="w-20 bg-muted/50 rounded-full h-1 mt-1">
                  <div 
                    className="bg-primary h-1 rounded-full" 
                    style={{ width: `${getProgressToNextLevel(userStats.totalXP, userStats.level)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-3/10 rounded-lg">
                <Star className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{userStats.totalXP.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {getXPToNextLevel(userStats.totalXP, userStats.level)} to next level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-5/10 rounded-lg">
                <Flame className="h-6 w-6 text-chart-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{userStats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">
                  Best: {userStats.longestStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Trophy className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold">#{userStats.rank}</p>
                <p className="text-xs text-muted-foreground">
                  {userStats.unlockedAchievements} achievements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quests">Active Quests</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeQuests.map((quest) => (
              <Card key={quest.id} className={`${quest.isCompleted ? 'border-chart-2/20 bg-chart-2/5' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getQuestTypeColor(quest.type)}`}>
                        {getQuestIcon(quest.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{quest.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {quest.description}
                        </CardDescription>
                      </div>
                    </div>
                    {quest.isCompleted && (
                      <CheckCircle className="h-6 w-6 text-chart-2" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{quest.currentProgress} / {quest.targetValue}</span>
                    </div>
                    <Progress 
                      value={(quest.currentProgress / quest.targetValue) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Rewards */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-chart-3" />
                      <span>{quest.xpReward} XP</span>
                    </div>
                    {quest.tokenReward > 0 && (
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-chart-2" />
                        <span>${quest.tokenReward}</span>
                      </div>
                    )}
                    {quest.badgeReward && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-chart-3" />
                        <span>Badge</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Time limit */}
                  {quest.timeLimit && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Expires: {new Date(quest.timeLimit).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {/* Completion info */}
                  {quest.isRepeatable && (
                    <div className="text-xs text-muted-foreground">
                      Completed {quest.completionCount} times • Repeatable
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${
                achievement.isUnlocked ? 'border-chart-3/20 bg-chart-3/5' : 
                achievement.isSecret && !achievement.isUnlocked ? 'border-border bg-muted/20' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    {/* Icon */}
                    <div className="text-4xl">
                      {achievement.isSecret && !achievement.isUnlocked ? '🔒' : achievement.icon}
                    </div>
                    
                    {/* Name & Description */}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {achievement.isSecret && !achievement.isUnlocked ? '???' : achievement.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.isSecret && !achievement.isUnlocked ? 'Secret achievement - complete to reveal' : achievement.description}
                      </p>
                    </div>
                    
                    {/* Progress */}
                    {!achievement.isSecret && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{achievement.currentProgress} / {achievement.requiredValue}</span>
                        </div>
                        <Progress 
                          value={(achievement.currentProgress / achievement.requiredValue) * 100} 
                          className="h-1"
                        />
                      </div>
                    )}
                    
                    {/* Rewards */}
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-chart-3" />
                        <span>{achievement.xpReward} XP</span>
                      </div>
                      {achievement.badgeReward && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-chart-3" />
                          <span>Badge</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className="pt-2">
                      {achievement.isUnlocked ? (
                        <Badge className="bg-chart-2/10 text-chart-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Unlocked
                        </Badge>
                      ) : achievement.isSecret ? (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Secret
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    
                    {/* Unlock date */}
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Tabs defaultValue="xp" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="xp">XP Leaderboard</TabsTrigger>
              <TabsTrigger value="streak">Streak Leaderboard</TabsTrigger>
              <TabsTrigger value="quests">Quest Leaderboard</TabsTrigger>
            </TabsList>

            {Object.entries(leaderboards).map(([type, entries]) => (
              <TabsContent key={type} value={type}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      {type === 'xp' ? 'Top XP Earners' : 
                       type === 'streak' ? 'Longest Streaks' : 
                       'Quest Completions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries.slice(0, 10).map((entry, index) => (
                        <div key={entry.address} className={`flex items-center gap-3 p-3 rounded-lg ${
                          entry.address === address ? 'bg-primary/5 border border-primary/20' : 'bg-muted/20'
                        }`}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            entry.rank === 1 ? 'bg-chart-3 text-white' :
                            entry.rank === 2 ? 'bg-muted-foreground text-white' :
                            entry.rank === 3 ? 'bg-chart-5 text-white' :
                            'bg-muted/50 text-foreground'
                          }`}>
                            {entry.rank <= 3 ? (
                              entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                            ) : (
                              entry.rank
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium">
                              {entry.displayName}
                              {entry.address === address && (
                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.address}</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold">
                              {type === 'xp' ? entry.score.toLocaleString() + ' XP' :
                               type === 'streak' ? entry.score + ' days' :
                               entry.score + ' quests'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/quests')({
  component: QuestsPage,
})