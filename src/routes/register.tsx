import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { WalletConnect } from '../components/wallet-connect';
import { signInWithEthereum } from '../lib/auth';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    twitter: '',
    discord: '',
    website: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [step, setStep] = useState<'connect' | 'form' | 'complete'>('connect');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setWarning('');

    try {
      // First, sign in with Ethereum to get JWT token
      const authResult = await signInWithEthereum(address, async (message: string) => {
        return await signMessageAsync({ 
          message,
          account: address 
        });
      });
      
      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      // Store the JWT token
      localStorage.setItem('kudobit_token', authResult.token || '');

      // Prepare social links
      const socialLinks: Record<string, string> = {};
      if (formData.twitter) socialLinks.twitter = formData.twitter;
      if (formData.discord) socialLinks.discord = formData.discord;
      if (formData.website) socialLinks.website = formData.website;

      // Prepare creator profile data
      const creatorProfile = {
        address: address.toLowerCase(),
        displayName: formData.displayName,
        bio: formData.bio,
        socialLinks,
        isVerified: false,
        isOnChainCreator: false,
        createdAt: new Date().toISOString()
      };

      // Try backend registration first
      let backendSuccess = false;
      try {
        const response = await fetch('http://localhost:3001/api/creator/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResult.token}`
          },
          body: JSON.stringify({
            displayName: formData.displayName,
            bio: formData.bio,
            socialLinks
          })
        });

        if (response.ok) {
          backendSuccess = true;
          console.log('Registration saved to backend');
        } else {
          const result = await response.json();
          console.warn('Backend registration failed:', result.error);
        }
      } catch (backendError) {
        console.warn('Backend not available:', backendError);
      }

      // Always save to localStorage as fallback (and for immediate access)
      const profiles = JSON.parse(localStorage.getItem('kudobit_profiles') || '{}');
      profiles[address.toLowerCase()] = {
        displayName: formData.displayName,
        bio: formData.bio,
        socialLinks,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('kudobit_profiles', JSON.stringify(profiles));

      // Save creator session for immediate access
      localStorage.setItem('kudobit_creator_profile', JSON.stringify(creatorProfile));
      localStorage.setItem('kudobit_user_role', 'creator');
      localStorage.setItem('kudobit_user_address', address.toLowerCase());

      console.log(`Registration completed - Backend: ${backendSuccess ? 'Success' : 'Failed'}, LocalStorage: Success`);
      
      // Show warning if backend failed but localStorage succeeded
      if (!backendSuccess) {
        setWarning('Registration completed locally. Some features may be limited until backend is available.');
        // Still navigate after a brief delay to show the warning
        setTimeout(() => navigate({ to: '/creator/dashboard' }), 2000);
      } else {
        // Navigate immediately if backend succeeded
        navigate({ to: '/creator/dashboard' });
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discover
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Join KudoBit as a Creator</CardTitle>
          <CardDescription>
            Set up your creator profile to start selling digital products and engaging with fans on Web3
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Connect your wallet to get started as a creator
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

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {warning && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">{warning}</p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleRegister}
                  disabled={isLoading || !formData.displayName.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Creating Profile...' : 'Create Creator Profile'}
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