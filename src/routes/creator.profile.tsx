import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { WalletConnect } from '../components/wallet-connect';
import { AuthService } from '../lib/auth';

export const Route = createFileRoute('/creator/profile')({
  component: CreatorProfilePage,
});

interface CreatorProfile {
  address: string;
  displayName: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  isVerified: boolean;
}

function CreatorProfilePage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    twitter: '',
    discord: '',
    website: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!address || !isConnected) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        // Verify authentication first
        const authResult = await AuthService.verifyAuth();
        if (!authResult.authenticated) {
          navigate({ to: '/register' });
          return;
        }

        // Load creator profile
        const profileData = await AuthService.getCreatorProfile(address);
        if (profileData) {
          setProfile(profileData);
          setFormData({
            displayName: profileData.displayName || '',
            bio: profileData.bio || '',
            twitter: profileData.socialLinks?.twitter || '',
            discord: profileData.socialLinks?.discord || '',
            website: profileData.socialLinks?.website || ''
          });
        } else {
          // Profile doesn't exist, redirect to register
          navigate({ to: '/register' });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [address, isConnected, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare social links
      const socialLinks: Record<string, string> = {};
      if (formData.twitter) socialLinks.twitter = formData.twitter;
      if (formData.discord) socialLinks.discord = formData.discord;
      if (formData.website) socialLinks.website = formData.website;

      // Update profile
      const result = await AuthService.updateCreatorProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        socialLinks
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Reload profile data
      const updatedProfile = await AuthService.getCreatorProfile(address);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      setError('');
      // Show success message (could be a toast in a real app)
      
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Creator Profile</CardTitle>
          <CardDescription>
            Manage your creator profile and social links
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Connect your wallet to manage your profile
              </p>
              <WalletConnect />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name *
                </Label>
                <Input
                  id="displayName"
                  placeholder="Your creator name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  placeholder="Tell your fans about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 text-sm border border-input bg-background rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-sm font-medium">
                    Twitter/X Handle
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discord" className="text-sm font-medium">
                    Discord Handle
                  </Label>
                  <Input
                    id="discord"
                    placeholder="username#1234"
                    value={formData.discord}
                    onChange={(e) => handleInputChange('discord', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium">
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://your-website.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              {profile?.isVerified && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">✅ Verified Creator</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading || !formData.displayName.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/admin' })}
                >
                  Go to Dashboard
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Connected wallet: {address}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}