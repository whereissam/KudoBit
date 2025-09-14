import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount, useWriteContract, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Gift, 
  ArrowLeft,
  Save,
  Calendar,
  Hash,
  Users,
  Star,
  Crown,
  Award,
  Trophy
} from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'
import { getChainById } from '@/lib/wagmi'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/creator/create-perk')({
  component: CreatePerkPage,
})

interface PerkFormData {
  name: string
  description: string
  perkType: string
  requiredBadgeId: string
  requiredBadgeContract: string
  minimumBadgeAmount: string
  metadata: string
  usageLimit: string
  expirationDays: string
  redemptionCode: string
}

const PERK_TYPES = [
  { value: 'discount', label: 'Discount Code', description: 'Percentage or fixed amount discount' },
  { value: 'exclusive_content', label: 'Exclusive Content', description: 'Access to special content' },
  { value: 'early_access', label: 'Early Access', description: 'Early access to new products' },
  { value: 'free_product', label: 'Free Product', description: 'Complimentary digital product' },
  { value: 'collaboration', label: 'Collaboration Invite', description: 'Invitation to collaborate' },
  { value: 'community_access', label: 'Community Access', description: 'Access to private community' },
  { value: 'custom', label: 'Custom Perk', description: 'Custom benefit defined by creator' }
]

const BADGE_TIERS = [
  { id: 1, name: 'Bronze Badge', icon: <Award className="h-4 w-4 text-chart-4" />, color: 'bg-chart-4/10 border-chart-4/20 text-chart-4' },
  { id: 2, name: 'Silver Badge', icon: <Trophy className="h-4 w-4 text-muted-foreground" />, color: 'bg-muted/30 border-border text-foreground' },
  { id: 3, name: 'Gold Badge', icon: <Star className="h-4 w-4 text-chart-1" />, color: 'bg-chart-1/10 border-chart-1/20 text-chart-1' },
  { id: 4, name: 'Diamond Badge', icon: <Crown className="h-4 w-4 text-chart-3" />, color: 'bg-chart-3/10 border-chart-3/20 text-chart-3' }
]

// Placeholder ABI for PerksRegistry contract
const PERKS_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "perkType", "type": "string"},
      {"internalType": "uint256", "name": "requiredBadgeId", "type": "uint256"},
      {"internalType": "address", "name": "requiredBadgeContract", "type": "address"},
      {"internalType": "uint256", "name": "minimumBadgeAmount", "type": "uint256"},
      {"internalType": "string", "name": "metadata", "type": "string"},
      {"internalType": "uint256", "name": "usageLimit", "type": "uint256"},
      {"internalType": "uint256", "name": "expirationTimestamp", "type": "uint256"},
      {"internalType": "string", "name": "redemptionCode", "type": "string"}
    ],
    "name": "createPerk",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

function CreatePerkPage() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const { writeContract, isPending } = useWriteContract()
  const chainId = useChainId()
  
  const [formData, setFormData] = useState<PerkFormData>({
    name: '',
    description: '',
    perkType: '',
    requiredBadgeId: '',
    requiredBadgeContract: CONTRACTS.loyaltyToken,
    minimumBadgeAmount: '1',
    metadata: '',
    usageLimit: '0',
    expirationDays: '0',
    redemptionCode: ''
  })
  
  const [errors, setErrors] = useState<Partial<PerkFormData>>({})

  const handleInputChange = (field: keyof PerkFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<PerkFormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Perk name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.perkType) newErrors.perkType = 'Please select a perk type'
    if (!formData.requiredBadgeId) newErrors.requiredBadgeId = 'Please select required badge tier'
    
    const minimumAmount = parseInt(formData.minimumBadgeAmount)
    if (isNaN(minimumAmount) || minimumAmount < 1) {
      newErrors.minimumBadgeAmount = 'Minimum badge amount must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreatePerk = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return
    }

    if (!validateForm()) {
      toast.error('Please fix form errors')
      return
    }

    try {
      // Calculate expiration timestamp
      const expirationTimestamp = formData.expirationDays === '0' ? 0 : 
        Math.floor(Date.now() / 1000) + (parseInt(formData.expirationDays) * 24 * 60 * 60)

      // Create metadata JSON
      const metadata = JSON.stringify({
        creator: address,
        createdAt: Math.floor(Date.now() / 1000),
        perkType: formData.perkType,
        instructions: formData.description,
        redemptionCode: formData.redemptionCode || null
      })

      // Note: This would need the actual deployed PerksRegistry contract address
      const perksRegistryAddress = '0x0000000000000000000000000000000000000000' // Placeholder

      await writeContract({
        address: perksRegistryAddress,
        abi: PERKS_REGISTRY_ABI,
        functionName: 'createPerk',
        chain: getChainById(chainId),
        account: address,
        args: [
          formData.name,
          formData.description,
          formData.perkType,
          BigInt(formData.requiredBadgeId),
          formData.requiredBadgeContract as `0x${string}`,
          BigInt(formData.minimumBadgeAmount),
          metadata,
          BigInt(formData.usageLimit),
          BigInt(expirationTimestamp),
          formData.redemptionCode
        ]
      })

      toast.success('Perk created successfully!')
      navigate({ to: '/creator/dashboard' })
    } catch (error) {
      console.error('Error creating perk:', error)
      toast.error('Failed to create perk')
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Gift className="h-5 w-5" />
              Create Cross-Creator Perk
            </CardTitle>
            <CardDescription>
              Connect your wallet to create perks for badge holders
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/creator/dashboard' })}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Create Cross-Creator Perk
          </CardTitle>
          <CardDescription>
            Create special perks that badge holders from any creator can redeem. Build cross-creator collaboration and reward loyal fans across the KudoBit ecosystem.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Perk Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Perk Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 20% Discount on All Products"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perkType">Perk Type *</Label>
              <Select value={formData.perkType} onValueChange={(value) => handleInputChange('perkType', value)}>
                <SelectTrigger className={errors.perkType ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select perk type" />
                </SelectTrigger>
                <SelectContent>
                  {PERK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.perkType && <p className="text-sm text-destructive">{errors.perkType}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Describe what this perk offers and how to redeem it..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full min-h-[100px] px-3 py-2 text-sm border rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                errors.description ? 'border-destructive' : 'border-input bg-background'
              }`}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Badge Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Badge Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="requiredBadgeId">Required Badge Tier *</Label>
                <Select value={formData.requiredBadgeId} onValueChange={(value) => handleInputChange('requiredBadgeId', value)}>
                  <SelectTrigger className={errors.requiredBadgeId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select badge tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_TIERS.map((badge) => (
                      <SelectItem key={badge.id} value={badge.id.toString()}>
                        <div className="flex items-center gap-2">
                          {badge.icon}
                          <span>{badge.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.requiredBadgeId && <p className="text-sm text-destructive">{errors.requiredBadgeId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumBadgeAmount">Minimum Badge Amount *</Label>
                <Input
                  id="minimumBadgeAmount"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.minimumBadgeAmount}
                  onChange={(e) => handleInputChange('minimumBadgeAmount', e.target.value)}
                  className={errors.minimumBadgeAmount ? 'border-destructive' : ''}
                />
                {errors.minimumBadgeAmount && <p className="text-sm text-destructive">{errors.minimumBadgeAmount}</p>}
                <p className="text-xs text-muted-foreground">
                  How many badges of this tier the user must own
                </p>
              </div>
            </div>
          </div>

          {/* Perk Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Perk Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  placeholder="0 (unlimited)"
                  value={formData.usageLimit}
                  onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of times this perk can be redeemed (0 = unlimited)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expirationDays">Expiration (Days)</Label>
                <Input
                  id="expirationDays"
                  type="number"
                  min="0"
                  placeholder="0 (never expires)"
                  value={formData.expirationDays}
                  onChange={(e) => handleInputChange('expirationDays', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of days until this perk expires (0 = never expires)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redemptionCode">Redemption Code (Optional)</Label>
              <Input
                id="redemptionCode"
                placeholder="e.g., LOYALFAN20, SPECIAL2024"
                value={formData.redemptionCode}
                onChange={(e) => handleInputChange('redemptionCode', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A code that will be revealed to eligible users when they redeem this perk
              </p>
            </div>
          </div>

          {/* Preview */}
          {formData.name && formData.description && formData.requiredBadgeId && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className="p-4 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{formData.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{formData.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {PERK_TYPES.find(t => t.value === formData.perkType)?.label}
                      </Badge>
                      {formData.requiredBadgeId && (
                        <Badge className={`text-xs ${BADGE_TIERS.find(b => b.id.toString() === formData.requiredBadgeId)?.color}`}>
                          Requires {BADGE_TIERS.find(b => b.id.toString() === formData.requiredBadgeId)?.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Gift className="h-8 w-8 text-primary/60" />
                </div>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCreatePerk}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Perk...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Perk
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/creator/dashboard' })}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
            <p className="font-medium text-primary mb-1">💡 Cross-Creator Perks</p>
            <p className="text-foreground/80">
              Your perk will be available to badge holders from ANY creator in the KudoBit ecosystem, 
              not just your own fans. This encourages cross-creator collaboration and helps you attract 
              new customers who are loyal supporters of other creators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}