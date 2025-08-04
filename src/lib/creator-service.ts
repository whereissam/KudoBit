import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, CREATOR_STORE_ABI } from './contracts'

export interface CreatorProfile {
  address: string
  displayName: string
  bio: string
  socialLinks: {
    twitter?: string
    discord?: string
    website?: string
  }
  isVerified: boolean
  isOnChainCreator: boolean
  createdAt: string
}

export class CreatorService {
  private static readonly BACKEND_URL = 'http://localhost:3001'

  // Check if user is the contract owner (on-chain creator)
  static async isOnChainCreator(address: string): Promise<boolean> {
    try {
      // This would normally use useReadContract, but we need to make it work in a service
      const response = await fetch(`${this.BACKEND_URL}/api/creator/check-onchain/${address}`)
      const data = await response.json()
      return data.isOwner || false
    } catch (error) {
      console.error('Error checking on-chain creator status:', error)
      return false
    }
  }

  // Check if user is registered as creator in backend
  static async isRegisteredCreator(address: string): Promise<{ isRegistered: boolean; profile?: CreatorProfile }> {
    try {
      // First check localStorage for demo data
      const profiles = JSON.parse(localStorage.getItem('kudobit_profiles') || '{}')
      const localProfile = profiles[address.toLowerCase()]
      
      if (localProfile) {
        const profile: CreatorProfile = {
          address: address.toLowerCase(),
          displayName: localProfile.displayName || `Creator ${address.slice(0, 6)}...${address.slice(-4)}`,
          bio: localProfile.bio || 'KudoBit creator',
          socialLinks: localProfile.socialLinks || {},
          isVerified: false,
          isOnChainCreator: false,
          createdAt: localProfile.createdAt || new Date().toISOString()
        }
        return { isRegistered: true, profile }
      }

      // Then check backend
      const response = await fetch(`${this.BACKEND_URL}/api/creator/${address}`)
      
      if (response.status === 404) {
        return { isRegistered: false }
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch creator profile')
      }
      
      const profile = await response.json()
      return { isRegistered: true, profile }
    } catch (error) {
      console.error('Error checking creator registration:', error)
      return { isRegistered: false }
    }
  }

  // Combined check for creator status
  static async getCreatorStatus(address: string): Promise<{
    canAccessCreatorFeatures: boolean
    isOnChainCreator: boolean
    isRegisteredCreator: boolean
    profile?: CreatorProfile
  }> {
    try {
      const [onChainResult, backendResult] = await Promise.all([
        this.isOnChainCreator(address),
        this.isRegisteredCreator(address)
      ])

      return {
        canAccessCreatorFeatures: onChainResult || backendResult.isRegistered,
        isOnChainCreator: onChainResult,
        isRegisteredCreator: backendResult.isRegistered,
        profile: backendResult.profile
      }
    } catch (error) {
      console.error('Error getting creator status:', error)
      return {
        canAccessCreatorFeatures: false,
        isOnChainCreator: false,
        isRegisteredCreator: false
      }
    }
  }

  // Register new creator
  static async registerCreator(
    address: string,
    profileData: {
      displayName: string
      bio: string
      socialLinks: { twitter?: string; discord?: string; website?: string }
    },
    authToken: string
  ): Promise<{ success: boolean; profile?: CreatorProfile; error?: string }> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/v1/creators/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          address,
          displayName: profileData.displayName,
          bio: profileData.bio,
          socialLinks: profileData.socialLinks
        })
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Registration failed' }
      }

      return { success: true, profile: result.profile }
    } catch (error) {
      console.error('Creator registration error:', error)
      return { success: false, error: 'Network error during registration' }
    }
  }

  // Sign in existing creator (check both on-chain and backend)
  static async signInCreator(address: string): Promise<{
    success: boolean
    profile?: CreatorProfile
    error?: string
    needsRegistration?: boolean
  }> {
    try {
      const status = await this.getCreatorStatus(address)
      
      if (status.canAccessCreatorFeatures) {
        // User has creator access
        if (status.profile) {
          return { success: true, profile: status.profile }
        } else if (status.isOnChainCreator) {
          // On-chain creator but no backend profile - create minimal profile
          const profile: CreatorProfile = {
            address,
            displayName: `Creator ${address.slice(0, 6)}...${address.slice(-4)}`,
            bio: 'On-chain creator',
            socialLinks: {},
            isVerified: false,
            isOnChainCreator: true,
            createdAt: new Date().toISOString()
          }
          return { success: true, profile }
        }
      }
      
      return { 
        success: false, 
        needsRegistration: true,
        error: 'Creator profile not found. Please register first.' 
      }
    } catch (error) {
      console.error('Creator sign in error:', error)
      return { success: false, error: 'Failed to sign in' }
    }
  }

  // Update local storage with creator profile
  static saveCreatorSession(profile: CreatorProfile) {
    localStorage.setItem('kudobit_creator_profile', JSON.stringify(profile))
    localStorage.setItem('kudobit_user_role', 'creator')
    localStorage.setItem('kudobit_user_address', profile.address.toLowerCase())
  }

  // Clear creator session
  static clearCreatorSession() {
    localStorage.removeItem('kudobit_creator_profile')
    localStorage.removeItem('kudobit_user_role')
    localStorage.removeItem('kudobit_user_address')
    localStorage.removeItem('kudobit_token')
  }

  // Get current creator session
  static getCurrentCreatorProfile(): CreatorProfile | null {
    try {
      const profile = localStorage.getItem('kudobit_creator_profile')
      const role = localStorage.getItem('kudobit_user_role')
      
      if (role === 'creator' && profile) {
        return JSON.parse(profile)
      }
    } catch (error) {
      console.error('Error getting creator profile:', error)
    }
    
    return null
  }
}