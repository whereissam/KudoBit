// Stub creator service to resolve imports
export const CreatorService = {
  getCurrentCreatorProfile: async () => ({ address: '', profile: null }),
  signInCreator: async (address: string) => ({ 
    success: false, 
    error: 'Not implemented', 
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

export default CreatorService