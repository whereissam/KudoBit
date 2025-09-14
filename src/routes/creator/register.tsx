import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Upload, User, Camera, Plus, X, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CONTRACTS, CREATOR_REGISTRY_ABI, PRODUCT_NFT_ABI } from '@/lib/contracts'
import { ipfsService } from '@/services/ipfs-service'

export const Route = createFileRoute('/creator/register')({
  component: CreatorRegister,
})

interface CreatorProfile {
  name: string
  bio: string
  avatar: string
  banner: string
  website: string
  socialLinks: string[]
  categories: string[]
}

const CREATOR_CATEGORIES = [
  'Digital Art', 'Photography', 'Graphic Design', 'UI/UX Design',
  'Music & Audio', 'Video & Animation', 'Writing & Publishing',
  'Software & Apps', 'Games', 'Education & Courses', 'Business & Finance',
  '3D & AR/VR', 'Fashion & Beauty', 'Fitness & Health', 'Other'
]

function CreatorRegister() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  
  const [profile, setProfile] = useState<CreatorProfile>({
    name: '',
    bio: '',
    avatar: '',
    banner: '',
    website: '',
    socialLinks: [''],
    categories: []
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationStep, setRegistrationStep] = useState<'register' | 'grant_role'>('register')

  const { writeContract, data: txHash } = useWriteContract()
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash })

  const handleInputChange = (field: keyof CreatorProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...profile.socialLinks]
    newLinks[index] = value
    setProfile(prev => ({ ...prev, socialLinks: newLinks }))
  }

  const addSocialLink = () => {
    setProfile(prev => ({ 
      ...prev, 
      socialLinks: [...prev.socialLinks, ''] 
    }))
  }

  const removeSocialLink = (index: number) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setProfile(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
    setIsUploading(true)
    try {
      const hash = await ipfsService.uploadFile(file)
      const ipfsUrl = `ipfs://${hash}`
      setProfile(prev => ({ ...prev, [type]: ipfsUrl }))
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded to IPFS!`)
    } catch (error) {
      console.error('IPFS upload error:', error)
      toast.error(`Failed to upload ${type} to IPFS`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!profile.name || !profile.bio || profile.categories.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setRegistrationStep('register')
    
    try {
      toast.loading('Registering creator profile...')
      await writeContract({
        address: CONTRACTS.creatorRegistry,
        abi: CREATOR_REGISTRY_ABI,
        functionName: 'registerCreator',
        args: [
          profile.name,
          profile.bio,
          profile.avatar || ''
        ],
      })
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'shortMessage' in error 
        ? (error as { shortMessage: string }).shortMessage 
        : 'Failed to register creator profile'
      toast.error(message)
      setIsSubmitting(false)
    }
  }

  // Handle transaction results
  if (isSuccess) {
    if (registrationStep === 'register') {
      // After registration, grant CREATOR_ROLE
      setRegistrationStep('grant_role')
      toast.success('Profile registered! Granting creator permissions...')
      writeContract({
        address: CONTRACTS.productNFT,
        abi: PRODUCT_NFT_ABI,
        functionName: 'grantRole',
        args: [
          '0x828634d95e775031b9ff576805c2feea7f67b6d4bb35b8c6ba75a74a5435da50', // CREATOR_ROLE hash
          address!
        ],
      })
    } else if (registrationStep === 'grant_role') {
      toast.success('Creator profile registered successfully!')
      setIsSubmitting(false)
      navigate({ to: '/creator' })
    }
  }

  if (isError) {
    toast.error('Transaction failed')
    setIsSubmitting(false)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            You need to connect your wallet to register as a creator
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Creator</h1>
          <p className="text-muted-foreground">
            Set up your creator profile and start selling your digital products
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Creator Profile</CardTitle>
            <CardDescription>
              This information will be displayed on your creator page and product listings
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Creator Name *</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your creator name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell people about yourself and what you create..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Profile Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Images</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Avatar Upload */}
                  <div className="space-y-2">
                    <Label>Profile Avatar</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {profile.avatar ? (
                        <div className="space-y-2">
                          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <Camera className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-sm text-green-600">Avatar uploaded</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload avatar</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'avatar')
                        }}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer inline-block mt-2"
                      >
                        <Button type="button" variant="outline" size="sm" disabled={isUploading}>
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <Label>Profile Banner</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {profile.banner ? (
                        <div className="space-y-2">
                          <div className="w-16 h-8 mx-auto bg-green-100 rounded flex items-center justify-center">
                            <Camera className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-sm text-green-600">Banner uploaded</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload banner</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'banner')
                        }}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="cursor-pointer inline-block mt-2"
                      >
                        <Button type="button" variant="outline" size="sm" disabled={isUploading}>
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Social Links</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addSocialLink}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Link
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {profile.socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={link}
                        onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                        placeholder="https://twitter.com/username"
                        className="flex-1"
                      />
                      {profile.socialLinks.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSocialLink(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <Label>Categories *</Label>
                <p className="text-sm text-muted-foreground">
                  Select the categories that best describe what you create
                </p>
                <div className="flex flex-wrap gap-2">
                  {CREATOR_CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={profile.categories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                {profile.categories.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {profile.categories.join(', ')}
                  </p>
                )}
              </div>

              {/* Wallet Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Connected Wallet</h4>
                <p className="text-sm text-muted-foreground">
                  {address}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This wallet will receive payments from your sales
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/' })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !profile.name || !profile.bio || profile.categories.length === 0}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Register as Creator'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}