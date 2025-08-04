import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Upload,
  User,
  Image,
  Globe,
  FileText,
  Star,
  Crown,
  AlertCircle,
  CheckCircle,
  Clock,
  Camera
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
}

interface CreatorProfile {
  // Basic Info
  displayName: string
  bio: string
  profileImage: File | null
  coverImage: File | null
  
  // Contact & Social
  email: string
  website: string
  twitter: string
  discord: string
  instagram: string
  
  // Content & Expertise
  category: string
  tags: string[]
  portfolioItems: string[]
  experience: string
  
  // Verification
  idDocument: File | null
  businessRegistration: File | null
  portfolioVerification: string
  
  // Settings
  notificationPreferences: {
    sales: boolean
    comments: boolean
    followers: boolean
    marketing: boolean
  }
}

const CREATOR_CATEGORIES = [
  'Digital Art & NFTs',
  'Music & Audio',
  'Video & Animation',
  'Photography',
  'Web Design & Templates',
  'Educational Content',
  'Writing & Documentation',
  'Software & Code',
  'Gaming Assets',
  'Other'
]

const POPULAR_TAGS = [
  'NFT', 'Digital Art', 'Music', 'Video', 'Design', 'Education', 'Gaming',
  'Web3', 'Crypto', 'Animation', 'Photography', 'Templates', 'Code'
]

function CreatorOnboardingPage() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<CreatorProfile>({
    displayName: '',
    bio: '',
    profileImage: null,
    coverImage: null,
    email: '',
    website: '',
    twitter: '',
    discord: '',
    instagram: '',
    category: '',
    tags: [],
    portfolioItems: [],
    experience: '',
    idDocument: null,
    businessRegistration: null,
    portfolioVerification: '',
    notificationPreferences: {
      sales: true,
      comments: true,
      followers: true,
      marketing: false
    }
  })

  const steps: OnboardingStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Tell us about yourself and your creative work',
      completed: !!(profile.displayName && profile.bio && profile.category),
      required: true
    },
    {
      id: 'profile',
      title: 'Profile Setup',
      description: 'Add photos and customize your creator profile',
      completed: !!(profile.profileImage || profile.coverImage),
      required: false
    },
    {
      id: 'social',
      title: 'Social Links',
      description: 'Connect your social media and website',
      completed: !!(profile.email && (profile.website || profile.twitter)),
      required: true
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Experience',
      description: 'Showcase your work and expertise',
      completed: !!(profile.portfolioItems.length > 0 && profile.experience),
      required: true
    },
    {
      id: 'verification',
      title: 'Verification (Optional)',
      description: 'Get verified for enhanced trust and visibility',
      completed: !!(profile.idDocument || profile.businessRegistration),
      required: false
    },
    {
      id: 'settings',
      title: 'Preferences',
      description: 'Configure your notification preferences',
      completed: true,
      required: true
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (file: File, type: 'profile' | 'cover' | 'id' | 'business') => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB')
      return
    }

    switch (type) {
      case 'profile':
        setProfile(prev => ({ ...prev, profileImage: file }))
        break
      case 'cover':
        setProfile(prev => ({ ...prev, coverImage: file }))
        break
      case 'id':
        setProfile(prev => ({ ...prev, idDocument: file }))
        break
      case 'business':
        setProfile(prev => ({ ...prev, businessRegistration: file }))
        break
    }
    
    toast.success('File uploaded successfully')
  }

  const addTag = (tag: string) => {
    if (!profile.tags.includes(tag) && profile.tags.length < 10) {
      setProfile(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addPortfolioItem = () => {
    if (profile.portfolioItems.length < 5) {
      setProfile(prev => ({
        ...prev,
        portfolioItems: [...prev.portfolioItems, '']
      }))
    }
  }

  const updatePortfolioItem = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.map((item, i) => 
        i === index ? value : item
      )
    }))
  }

  const removePortfolioItem = (index: number) => {
    setProfile(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter((_, i) => i !== index)
    }))
  }

  const completeOnboarding = async () => {
    try {
      setLoading(true)
      
      // Validate required fields
      const requiredSteps = steps.filter(step => step.required)
      const incompleteRequiredSteps = requiredSteps.filter(step => !step.completed)
      
      if (incompleteRequiredSteps.length > 0) {
        toast.error('Please complete all required steps')
        return
      }

      // Mock API call to save creator profile
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Creator profile created successfully!')
      navigate({ to: '/creator/dashboard' })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      toast.error('Failed to create creator profile')
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = (steps.filter(step => step.completed).length / steps.length) * 100

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to start the creator onboarding process.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to KudoBit Creator Program
        </h1>
        <p className="text-gray-600 mb-4">
          Let's set up your creator profile and get you ready to start selling
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center min-w-0">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : step.completed
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                {step.completed ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  index === currentStep ? 'text-blue-600' : 
                  step.completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                  {step.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep].completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {steps[currentStep].title}
            {steps[currentStep].required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Your creator name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={profile.category}
                    onChange={(e) => setProfile(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    {CREATOR_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio *</Label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell your audience about yourself and your work..."
                  className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profile.bio.length}/500 characters
                </p>
              </div>

              <div>
                <Label>Tags (up to 10)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      disabled={profile.tags.includes(tag) || profile.tags.length >= 10}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Profile Setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.profileImage ? (
                      <img 
                        src={URL.createObjectURL(profile.profileImage)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    <p className="text-xs text-gray-500">
                      Recommended: 400x400px, max 5MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'profile')
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Cover Image</Label>
                <div className="mt-2">
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {profile.coverImage ? (
                      <img 
                        src={URL.createObjectURL(profile.coverImage)} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => coverInputRef.current?.click()}
                    className="mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Cover Image
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1200x300px, max 10MB
                  </p>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'cover')
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Social Links */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
                    placeholder="@yourusername"
                  />
                </div>
                
                <div>
                  <Label htmlFor="discord">Discord</Label>
                  <Input
                    id="discord"
                    value={profile.discord}
                    onChange={(e) => setProfile(prev => ({ ...prev, discord: e.target.value }))}
                    placeholder="username#1234"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={profile.instagram}
                  onChange={(e) => setProfile(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@yourusername"
                />
              </div>
            </div>
          )}

          {/* Step 4: Portfolio & Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Portfolio Items *</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Add links to your best work (up to 5 items)
                </p>
                
                {profile.portfolioItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => updatePortfolioItem(index, e.target.value)}
                      placeholder="https://example.com/your-work"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePortfolioItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                {profile.portfolioItems.length < 5 && (
                  <Button variant="outline" onClick={addPortfolioItem}>
                    Add Portfolio Item
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="experience">Experience & Background *</Label>
                <textarea
                  id="experience"
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Tell us about your creative experience, skills, and what makes your work unique..."
                  className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 5: Verification */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Get Verified</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Verification increases trust and can boost your sales by up to 40%. 
                      It also unlocks exclusive features like higher commission rates and priority support.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Identity Verification</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Upload a government-issued ID for identity verification
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {profile.idDocument ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600">
                        {profile.idDocument.name}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Drop your ID document here or click to upload
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'id')
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Business Registration (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">
                  For business accounts, upload your business registration documents
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {profile.businessRegistration ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600">
                        {profile.businessRegistration.name}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Drop your business documents here or click to upload
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'business')
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolioVerification">Portfolio Verification Link</Label>
                <Input
                  id="portfolioVerification"
                  value={profile.portfolioVerification}
                  onChange={(e) => setProfile(prev => ({ ...prev, portfolioVerification: e.target.value }))}
                  placeholder="Link to verify your portfolio authenticity"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Link to your existing portfolio, Behance, Dribbble, etc.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Settings */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'sales', label: 'Sales & Revenue', description: 'Get notified when you make a sale' },
                    { key: 'comments', label: 'Comments & Reviews', description: 'Notifications for product feedback' },
                    { key: 'followers', label: 'New Followers', description: 'When someone follows your profile' },
                    { key: 'marketing', label: 'Marketing Updates', description: 'Platform updates and promotions' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.notificationPreferences[key as keyof typeof profile.notificationPreferences]}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            [key]: e.target.checked
                          }
                        }))}
                        className="w-4 h-4"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">Ready to Launch!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      You're all set to start your creator journey on KudoBit. 
                      Click "Complete Setup" to create your profile and access the creator dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {steps.filter(step => step.required && !step.completed).length > 0 && (
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>{steps.filter(step => step.required && !step.completed).length} required steps remaining</span>
            </div>
          )}
        </div>

        {currentStep === steps.length - 1 ? (
          <Button 
            onClick={completeOnboarding}
            disabled={loading || steps.filter(step => step.required && !step.completed).length > 0}
            className="min-w-[140px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                Creating...
              </div>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Complete Setup
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/creator/onboarding')({
  component: CreatorOnboardingPage,
})