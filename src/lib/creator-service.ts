import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractConfig } from './multi-chain-contracts'
import { parseUnits } from 'viem'

// Creator profile types
export interface CreatorProfile {
  address: string
  displayName: string
  bio: string
  website?: string
  twitter?: string
  discord?: string
  profileImage?: string
  bannerImage?: string
  verified: boolean
  joinedAt: string
  specialties: string[]
  totalProducts: number
  totalRevenue: string
  rating: number
  followers: number
  isOnboarded: boolean
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started'
  paymentMethods: PaymentMethod[]
}

export interface PaymentMethod {
  type: 'wallet' | 'stripe' | 'paypal'
  address?: string
  accountId?: string
  isDefault: boolean
  verified: boolean
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  estimatedTime: string
}

export interface CreatorKYC {
  personalInfo: {
    fullName: string
    email: string
    country: string
    dateOfBirth: string
  }
  businessInfo?: {
    businessName: string
    businessType: string
    taxId: string
    businessAddress: string
  }
  documents: {
    idDocument?: File
    proofOfAddress?: File
    businessLicense?: File
  }
  status: 'pending' | 'approved' | 'rejected' | 'not_started'
  submittedAt?: string
  reviewedAt?: string
  notes?: string
}

// Creator onboarding service
export class CreatorOnboardingService {
  private static baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

  // Get creator profile
  static async getCreatorProfile(address: string): Promise<CreatorProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/creators/${address}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null // Creator doesn't exist yet
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching creator profile:', error)
      return null
    }
  }

  // Create new creator profile
  static async createCreatorProfile(profile: Partial<CreatorProfile>): Promise<CreatorProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/api/creators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating creator profile:', error)
      throw error
    }
  }

  // Update creator profile
  static async updateCreatorProfile(address: string, updates: Partial<CreatorProfile>): Promise<CreatorProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/api/creators/${address}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating creator profile:', error)
      throw error
    }
  }

  // Get onboarding steps for a creator
  static async getOnboardingSteps(address: string): Promise<OnboardingStep[]> {
    try {
      const profile = await this.getCreatorProfile(address)
      
      return [
        {
          id: 'wallet-connect',
          title: 'Connect Wallet',
          description: 'Connect your Web3 wallet to get started',
          completed: !!address,
          required: true,
          estimatedTime: '2 min'
        },
        {
          id: 'profile-setup',
          title: 'Complete Profile',
          description: 'Add your display name, bio, and social links',
          completed: !!(profile?.displayName && profile?.bio),
          required: true,
          estimatedTime: '5 min'
        },
        {
          id: 'kyc-verification',
          title: 'Identity Verification',
          description: 'Complete KYC verification for higher limits',
          completed: profile?.kycStatus === 'approved',
          required: false,
          estimatedTime: '10 min'
        },
        {
          id: 'payment-setup',
          title: 'Payment Methods',
          description: 'Set up how you want to receive payments',
          completed: !!(profile?.paymentMethods && profile.paymentMethods.length > 0),
          required: true,
          estimatedTime: '3 min'
        },
        {
          id: 'first-product',
          title: 'Create First Product',
          description: 'Upload your first digital product to start selling',
          completed: (profile?.totalProducts || 0) > 0,
          required: false,
          estimatedTime: '15 min'
        },
        {
          id: 'verification-badge',
          title: 'Get Verified',
          description: 'Apply for verified creator status',
          completed: profile?.verified || false,
          required: false,
          estimatedTime: '24 hours'
        }
      ]
    } catch (error) {
      console.error('Error fetching onboarding steps:', error)
      return []
    }
  }

  // Submit KYC information
  static async submitKYC(address: string, kycData: CreatorKYC): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData()
      
      // Add personal info
      formData.append('personalInfo', JSON.stringify(kycData.personalInfo))
      
      // Add business info if provided
      if (kycData.businessInfo) {
        formData.append('businessInfo', JSON.stringify(kycData.businessInfo))
      }
      
      // Add documents
      if (kycData.documents.idDocument) {
        formData.append('idDocument', kycData.documents.idDocument)
      }
      if (kycData.documents.proofOfAddress) {
        formData.append('proofOfAddress', kycData.documents.proofOfAddress)
      }
      if (kycData.documents.businessLicense) {
        formData.append('businessLicense', kycData.documents.businessLicense)
      }

      const response = await fetch(`${this.baseUrl}/api/creators/${address}/kyc`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error submitting KYC:', error)
      return { success: false, message: 'Failed to submit KYC information' }
    }
  }

  // Request verification badge
  static async requestVerification(address: string, portfolio: {
    socialProof: string[]
    achievements: string[]
    portfolio: string[]
    testimonials: string[]
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/creators/${address}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolio),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error requesting verification:', error)
      return { success: false, message: 'Failed to submit verification request' }
    }
  }

  // Upload profile image
  static async uploadProfileImage(address: string, file: File): Promise<{ success: boolean; url?: string; message: string }> {
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'profile')

      const response = await fetch(`${this.baseUrl}/api/creators/${address}/upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error uploading profile image:', error)
      return { success: false, message: 'Failed to upload image' }
    }
  }
}

// Legacy compatibility - minimal stub
export const CreatorService = {
  getCurrentCreatorProfile: async () => ({ address: '', profile: null }),
  signInCreator: async (address: string) => ({ 
    success: false, 
    error: 'Use CreatorOnboardingService instead', 
    profile: null,
    needsRegistration: false 
  }),
  saveCreatorSession: async (profile: any) => ({ success: false }),
  getCreatorStatus: async (address: string) => ({ 
    isRegistered: false, 
    profile: null,
    canAccessCreatorFeatures: false
  })
}