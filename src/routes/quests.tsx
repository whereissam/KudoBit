import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
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
import toast from 'react-hot-toast'

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
  const [userStats, setUserStats] = useState<UserStats>({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    completedQuests: 0,
    unlockedAchievements: 0,
    rank: 0
  })
  const [activeQuests, setActiveQuests] = useState<Quest[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboards, setLeaderboards] = useState<{
    xp: LeaderboardEntry[]
    streak: LeaderboardEntry[]
    quests: LeaderboardEntry[]
  }>({
    xp: [],
    streak: [],
    quests: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      loadUserStats()
      loadQuests()
      loadAchievements()
      loadLeaderboards()
    }
  }, [isConnected, address])

  const loadUserStats = async () => {
    try {
      // Mock data - replace with contract calls
      const stats: UserStats = {
        totalXP: 12500,
        level: 5,
        currentStreak: 12,
        longestStreak: 28,
        completedQuests: 15,
        unlockedAchievements: 8,
        rank: 42
      }
      setUserStats(stats)
    } catch (error) {
      console.error('Failed to load user stats:', error)
    }
  }

  const loadQuests = async () => {
    try {
      // Mock data - replace with contract calls
      const quests: Quest[] = [
        {
          id: '1',
          name: 'Daily Check-in',
          description: 'Log in to KudoBit every day to maintain your streak',
          type: 'daily',
          targetValue: 1,
          currentProgress: 1,
          xpReward: 100,
          tokenReward: 0.01,
          timeLimit: Date.now() + 86400000,
          isCompleted: true,
          isRepeatable: true,
          completionCount: 12
        },
        {
          id: '2',
          name: 'First Purchase',
          description: 'Make your first purchase on KudoBit',
          type: 'purchase',
          targetValue: 1,
          currentProgress: 1,
          xpReward: 500,
          tokenReward: 0.05,
          badgeReward: 1,
          isCompleted: true,
          isRepeatable: false,
          completionCount: 1
        },
        {
          id: '3',
          name: 'Big Spender',
          description: 'Spend $5 or more in a single transaction',
          type: 'spend',
          targetValue: 5,
          currentProgress: 2.3,
          xpReward: 1000,
          tokenReward: 0.1,
          badgeReward: 2,
          isCompleted: false,
          isRepeatable: true,
          completionCount: 0
        },
        {
          id: '4',
          name: 'Community Champion',
          description: 'Post 5 messages in the community forum',
          type: 'community',
          targetValue: 5,
          currentProgress: 3,
          xpReward: 300,
          tokenReward: 0.025,
          timeLimit: Date.now() + 604800000,
          isCompleted: false,
          isRepeatable: true,
          completionCount: 0
        },
        {
          id: '5',
          name: 'Creator Supporter',
          description: 'Purchase from 3 different creators',
          type: 'creator',
          targetValue: 3,
          currentProgress: 1,
          xpReward: 750,
          tokenReward: 0.075,
          badgeReward: 2,
          isCompleted: false,
          isRepeatable: false,
          completionCount: 0
        }
      ]
      setActiveQuests(quests)
    } catch (error) {
      console.error('Failed to load quests:', error)
    }
  }

  const loadAchievements = async () => {
    try {
      // Mock data - replace with contract calls
      const achievements: Achievement[] = [
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first quest',
          icon: '🎯',
          type: 'milestone',
          requiredValue: 1,
          currentProgress: 1,
          xpReward: 200,
          badgeReward: 1,
          isUnlocked: true,
          isSecret: false,
          unlockedAt: Date.now() - 86400000
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Maintain a 30-day login streak',
          icon: '🔥',
          type: 'streak',
          requiredValue: 30,
          currentProgress: 12,
          xpReward: 2000,
          badgeReward: 3,
          isUnlocked: false,
          isSecret: false
        },
        {
          id: '3',
          name: 'Whale Status',
          description: 'Spend over $100 on KudoBit',
          icon: '🐋',
          type: 'milestone',
          requiredValue: 100,
          currentProgress: 23.5,
          xpReward: 5000,
          badgeReward: 4,
          isUnlocked: false,
          isSecret: false
        },
        {
          id: '4',
          name: 'Early Adopter',
          description: 'One of the first 100 users on KudoBit',
          icon: '⭐',
          type: 'rare',
          requiredValue: 100,
          currentProgress: 42,
          xpReward: 10000,
          badgeReward: 4,
          isUnlocked: true,
          isSecret: true,
          unlockedAt: Date.now() - 2592000000
        },
        {
          id: '5',
          name: 'Secret Achievement',
          description: '???',
          icon: '🔒',
          type: 'special',
          requiredValue: 1,
          currentProgress: 0,
          xpReward: 1000,
          isUnlocked: false,
          isSecret: true
        }
      ]
      setAchievements(achievements)
    } catch (error) {
      console.error('Failed to load achievements:', error)
    }
  }

  const loadLeaderboards = async () => {
    try {
      // Mock data - replace with API calls
      const mockLeaderboards = {
        xp: [
          { rank: 1, address: '0x1234...5678', displayName: 'CryptoKing', score: 50000 },
          { rank: 2, address: '0x2345...6789', displayName: 'NFTCollector', score: 45000 },
          { rank: 3, address: '0x3456...7890', displayName: 'DigitalArtist', score: 42000 },
          { rank: 42, address: address || '0x...', displayName: 'You', score: 12500 },
        ],
        streak: [
          { rank: 1, address: '0x1234...5678', displayName: 'ConsistentUser', score: 156 },
          { rank: 2, address: '0x2345...6789', displayName: 'DailyVisitor', score: 89 },
          { rank: 3, address: '0x3456...7890', displayName: 'RegularUser', score: 67 },
        ],
        quests: [
          { rank: 1, address: '0x1234...5678', displayName: 'QuestMaster', score: 234 },
          { rank: 2, address: '0x2345...6789', displayName: 'Achiever', score: 198 },
          { rank: 3, address: '0x3456...7890', displayName: 'TaskCompletionist', score: 156 },
        ]
      }
      setLeaderboards(mockLeaderboards)
    } catch (error) {
      console.error('Failed to load leaderboards:', error)
    } finally {
      setLoading(false)
    }
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
      case 'daily': return 'bg-blue-100 text-blue-800'
      case 'purchase': return 'bg-green-100 text-green-800'
      case 'spend': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-pink-100 text-pink-800'
      case 'creator': return 'bg-yellow-100 text-yellow-800'
      case 'community': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
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
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quests & Achievements</h1>
        <p className="text-gray-600">Complete quests and unlock achievements to earn rewards</p>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
                <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full" 
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-2xl font-bold">{userStats.totalXP.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {getXPToNextLevel(userStats.totalXP, userStats.level)} to next level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold">{userStats.currentStreak}</p>
                <p className="text-xs text-gray-500">
                  Best: {userStats.longestStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rank</p>
                <p className="text-2xl font-bold">#{userStats.rank}</p>
                <p className="text-xs text-gray-500">
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
              <Card key={quest.id} className={`${quest.isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
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
                      <CheckCircle className="h-6 w-6 text-green-600" />
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
                      <Star className="h-4 w-4 text-purple-500" />
                      <span>{quest.xpReward} XP</span>
                    </div>
                    {quest.tokenReward > 0 && (
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-green-500" />
                        <span>${quest.tokenReward}</span>
                      </div>
                    )}
                    {quest.badgeReward && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>Badge</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Time limit */}
                  {quest.timeLimit && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        Expires: {new Date(quest.timeLimit).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {/* Completion info */}
                  {quest.isRepeatable && (
                    <div className="text-xs text-gray-500">
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
                achievement.isUnlocked ? 'border-yellow-200 bg-yellow-50' : 
                achievement.isSecret && !achievement.isUnlocked ? 'border-gray-200 bg-gray-50' : ''
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
                      <p className="text-sm text-gray-600 mt-1">
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
                        <Star className="h-4 w-4 text-purple-500" />
                        <span>{achievement.xpReward} XP</span>
                      </div>
                      {achievement.badgeReward && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>Badge</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className="pt-2">
                      {achievement.isUnlocked ? (
                        <Badge className="bg-green-100 text-green-800">
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
                      <p className="text-xs text-gray-500">
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
                          entry.address === address ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                        }`}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            entry.rank === 1 ? 'bg-yellow-400 text-white' :
                            entry.rank === 2 ? 'bg-gray-400 text-white' :
                            entry.rank === 3 ? 'bg-orange-400 text-white' :
                            'bg-gray-200 text-gray-700'
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
                            <p className="text-xs text-gray-500">{entry.address}</p>
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