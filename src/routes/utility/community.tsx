import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Send, 
  Heart, 
  Reply, 
  Pin,
  Users,
  Crown,
  Star,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Plus
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import toast from 'react-hot-toast'

interface ForumPost {
  id: string
  title: string
  content: string
  author: {
    address: string
    displayName: string
    avatar?: string
    isCreator: boolean
    isVerified: boolean
    loyaltyTier: number
  }
  createdAt: number
  updatedAt: number
  category: string
  tags: string[]
  likes: number
  replies: number
  isPinned: boolean
  isLocked: boolean
  hasLiked: boolean
}

interface ForumReply {
  id: string
  content: string
  author: {
    address: string
    displayName: string
    avatar?: string
    isCreator: boolean
    loyaltyTier: number
  }
  createdAt: number
  likes: number
  hasLiked: boolean
  parentId?: string
}

interface ChatMessage {
  id: string
  content: string
  author: {
    address: string
    displayName: string
    avatar?: string
    isCreator: boolean
  }
  timestamp: number
  type: 'message' | 'announcement' | 'system'
}

const FORUM_CATEGORIES = [
  'General Discussion',
  'Creator Spotlight',
  'Product Feedback',
  'Technical Support',
  'Feature Requests',
  'Community Events'
]

function CommunityPage() {
  const { address, isConnected } = useAccount()
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [postReplies, setPostReplies] = useState<ForumReply[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostCategory, setNewPostCategory] = useState('General Discussion')
  const [replyContent, setReplyContent] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadForumPosts()
    loadChatMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadForumPosts = async () => {
    try {
      setForumPosts([])
    } catch (error) {
      console.error('Failed to load forum posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async () => {
    try {
      setChatMessages([])
    } catch (error) {
      console.error('Failed to load chat messages:', error)
    }
  }

  const createForumPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    toast.error('Forum functionality not yet implemented')
    setShowCreatePost(false)
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    
    toast.error('Chat functionality not yet implemented')
    setChatInput('')
  }

  const likePost = async (_postId: string) => {
    toast.error('Like functionality not yet implemented')
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getLoyaltyBadgeColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-orange-100 text-chart-5'
      case 2: return 'bg-muted/30 text-gray-800'
      case 3: return 'bg-yellow-100 text-chart-3'
      case 4: return 'bg-blue-100 text-primary'
      default: return 'bg-muted/30 text-muted-foreground'
    }
  }

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to participate in the community.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground">Connect with creators and fellow users</p>
      </div>

      <Tabs defaultValue="forum" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
        </TabsList>

        {/* Forum Tab */}
        <TabsContent value="forum" className="space-y-6">
          {/* Forum Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="All">All Categories</option>
                {FORUM_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <Button onClick={() => setShowCreatePost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* Create Post Modal */}
          {showCreatePost && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Post title..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>
                <div>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {FORUM_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Write your post content..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createForumPost}>Create Post</Button>
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forum Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted/50 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} className={`hover:shadow-md transition-shadow ${post.isPinned ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {post.author.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-chart-3" />}
                          <h3 className="font-semibold text-foreground truncate">
                            {post.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                          <span className="font-medium">{post.author.displayName}</span>
                          {post.author.isCreator && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Creator
                            </Badge>
                          )}
                          {post.author.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getLoyaltyBadgeColor(post.author.loyaltyTier)}`}>
                            Tier {post.author.loyaltyTier}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-foreground text-sm mb-3 line-clamp-2">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button
                            onClick={() => likePost(post.id)}
                            className={`flex items-center gap-1 hover:text-destructive transition-colors ${
                              post.hasLiked ? 'text-destructive' : ''
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </button>
                          
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            {post.replies}
                          </button>
                          
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          {post.author.address === address && (
                            <DropdownMenuItem className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No posts found</p>
                  <p className="text-xs text-muted-foreground">Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Community Chat</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>42 online</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.author.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {message.author.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.author.displayName}
                            </span>
                            {message.author.isCreator && (
                              <Badge variant="secondary" className="text-xs">
                                Creator
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(message.timestamp)}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            message.type === 'system' 
                              ? 'text-muted-foreground italic' 
                              : 'text-foreground'
                          }`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendChatMessage} disabled={!chatInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Online Users */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Online Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Online users will be populated via WebSocket */
                  [].map((user: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          user.isOnline ? 'bg-chart-2' : 'bg-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.isCreator && (
                          <Badge variant="secondary" className="text-xs">
                            Creator
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/utility/community')({
  component: CommunityPage,
})