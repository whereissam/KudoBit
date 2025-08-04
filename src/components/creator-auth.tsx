import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, LogIn, LogOut, Loader2, CheckCircle } from 'lucide-react'
import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { AuthService } from '@/lib/auth'
import toast from 'react-hot-toast'

export function CreatorAuth() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated())
  const [creatorProfile, setCreatorProfile] = useState<any>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    socialLinks: { twitter: '', website: '' }
  })

  const handleLogin = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsAuthenticating(true)
    
    try {
      // Create wrapper function for signMessageAsync
      const signMessageWrapper = async (message: string) => {
        return await signMessageAsync({
          message,
          account: address,
        })
      }
      
      const result = await AuthService.login(address, chainId, signMessageWrapper)
      
      if (result.success) {
        setIsAuthenticated(true)
        toast.success('Successfully signed in as creator! 🎉')
        
        // Fetch creator profile
        const profile = await AuthService.getCreatorProfile(address)
        if (profile) {
          setCreatorProfile(profile)
          setProfileForm({
            displayName: profile.displayName,
            bio: profile.bio,
            socialLinks: profile.socialLinks || { twitter: '', website: '' }
          })
        }
      } else {
        toast.error(result.error || 'Authentication failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Authentication failed: ' + (error.message || 'Unknown error'))
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    await AuthService.logout()
    setIsAuthenticated(false)
    setCreatorProfile(null)
    toast.success('Signed out successfully')
  }

  const handleUpdateProfile = async () => {
    try {
      const result = await AuthService.updateCreatorProfile(profileForm)
      
      if (result.success) {
        toast.success('Profile updated successfully! ✨')
        setIsEditingProfile(false)
        
        // Refresh profile data
        if (address) {
          const profile = await AuthService.getCreatorProfile(address)
          setCreatorProfile(profile)
        }
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (!isConnected || !address) {
    return (
      <Card className="border-muted-foreground/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Creator Authentication
          </CardTitle>
          <CardDescription>Connect your wallet to sign in as a creator</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-primary/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Creator Authentication
          </CardTitle>
          <CardDescription>
            Sign in with Ethereum to access creator features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm">
            <p className="text-muted-foreground mb-2">
              <strong>Wallet-Based Authentication:</strong>
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• No passwords required</li>
              <li>• Cryptographically secure</li>
              <li>• You own your identity</li>
              <li>• Based on EIP-4361 (Sign-In with Ethereum)</li>
            </ul>
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing Message...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login as Creator
              </span>
            )}
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <div className="text-xs">
              <span className="text-muted-foreground">New creator? </span>
              <a href="/register" className="text-primary hover:underline font-medium">
                Register here
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-chart-1" />
            Creator Profile
          </span>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-destructive border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </CardTitle>
        <CardDescription>
          Authenticated as creator with wallet-based identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-sm">Display Name</Label>
              <Input
                id="displayName"
                value={profileForm.displayName}
                onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                placeholder="Your creator name"
              />
            </div>
            
            <div>
              <Label htmlFor="bio" className="text-sm">Bio</Label>
              <Input
                id="bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell your audience about yourself"
              />
            </div>
            
            <div>
              <Label htmlFor="twitter" className="text-sm">Twitter</Label>
              <Input
                id="twitter"
                value={profileForm.socialLinks.twitter}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  socialLinks: { ...profileForm.socialLinks, twitter: e.target.value }
                })}
                placeholder="@yourusername"
              />
            </div>
            
            <div>
              <Label htmlFor="website" className="text-sm">Website</Label>
              <Input
                id="website"
                value={profileForm.socialLinks.website}
                onChange={(e) => setProfileForm({ 
                  ...profileForm, 
                  socialLinks: { ...profileForm.socialLinks, website: e.target.value }
                })}
                placeholder="https://yoursite.com"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile} size="sm">
                Save Changes
              </Button>
              <Button 
                onClick={() => setIsEditingProfile(false)} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {creatorProfile && (
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">{creatorProfile.displayName}</p>
                  <p className="text-xs text-muted-foreground">{address}</p>
                </div>
                
                {creatorProfile.bio && (
                  <p className="text-sm text-muted-foreground">{creatorProfile.bio}</p>
                )}
                
                {(creatorProfile.socialLinks?.twitter || creatorProfile.socialLinks?.website) && (
                  <div className="flex gap-2 text-xs">
                    {creatorProfile.socialLinks.twitter && (
                      <span className="text-primary">@{creatorProfile.socialLinks.twitter}</span>
                    )}
                    {creatorProfile.socialLinks.website && (
                      <span className="text-primary">{creatorProfile.socialLinks.website}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={() => setIsEditingProfile(true)} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              Edit Profile
            </Button>
            
            <div className="bg-chart-1/10 rounded-lg p-3 text-sm">
              <p className="text-green-800 font-medium mb-1">✅ Authentication Benefits:</p>
              <ul className="text-green-700 text-xs space-y-1">
                <li>• Secure wallet-based identity</li>
                <li>• No centralized account to lose</li>
                <li>• Cryptographic proof of ownership</li>
                <li>• Decentralized profile management</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}