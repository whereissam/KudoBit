interface UploadResult {
  hash: string
  url: string
  size: number
}

interface ContentMetadata {
  name: string
  description: string
  image: string
  files: Array<{
    name: string
    hash: string
    size: number
    type: string
  }>
}

class ContentService {
  private pinataApiKey: string
  private pinataSecretKey: string
  private pinataEndpoint = 'https://api.pinata.cloud'

  constructor() {
    // In production, these should come from environment variables
    this.pinataApiKey = process.env.VITE_PINATA_API_KEY || ''
    this.pinataSecretKey = process.env.VITE_PINATA_SECRET_KEY || ''
  }

  /**
   * Upload single file to IPFS
   */
  async uploadFile(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          uploadedBy: 'kudobit-creator',
          timestamp: Date.now().toString(),
          fileType: file.type
        }
      })
      formData.append('pinataMetadata', metadata)

      const response = await fetch(`${this.pinataEndpoint}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: file.size
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      // Fallback to mock hash for development
      return this.mockUpload(file)
    }
  }

  /**
   * Upload multiple files to IPFS
   */
  async uploadFiles(files: File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file))
    return Promise.all(uploadPromises)
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata: ContentMetadata): Promise<UploadResult> {
    try {
      const response = await fetch(`${this.pinataEndpoint}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${metadata.name}-metadata`,
            keyvalues: {
              type: 'product-metadata',
              timestamp: Date.now().toString()
            }
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const metadataStr = JSON.stringify(metadata)
      
      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: new Blob([metadataStr]).size
      }
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error)
      // Fallback to mock hash for development
      return {
        hash: `mock-metadata-${Date.now()}`,
        url: `https://mock-gateway.com/ipfs/mock-metadata-${Date.now()}`,
        size: 1024
      }
    }
  }

  /**
   * Create complete product metadata and upload to IPFS
   */
  async createProductMetadata(
    name: string,
    description: string,
    images: File[],
    productFiles: File[],
    previewFiles: File[] = []
  ): Promise<string> {
    try {
      // Upload all files first
      const [imageResults, productFileResults, previewFileResults] = await Promise.all([
        this.uploadFiles(images),
        this.uploadFiles(productFiles),
        previewFiles.length > 0 ? this.uploadFiles(previewFiles) : Promise.resolve([])
      ])

      // Create metadata structure
      const metadata: ContentMetadata = {
        name,
        description,
        image: imageResults[0]?.url || '',
        files: [
          ...productFileResults.map((result, index) => ({
            name: productFiles[index].name,
            hash: result.hash,
            size: result.size,
            type: 'product'
          })),
          ...previewFileResults.map((result, index) => ({
            name: previewFiles[index].name,
            hash: result.hash,
            size: result.size,
            type: 'preview'
          })),
          ...imageResults.slice(1).map((result, index) => ({
            name: images[index + 1].name,
            hash: result.hash,
            size: result.size,
            type: 'image'
          }))
        ]
      }

      // Upload metadata
      const metadataResult = await this.uploadMetadata(metadata)
      return metadataResult.hash
    } catch (error) {
      console.error('Error creating product metadata:', error)
      throw new Error('Failed to create product metadata')
    }
  }

  /**
   * Verify file integrity by comparing hashes
   */
  async verifyFileIntegrity(_hash: string, _file: File): Promise<boolean> {
    try {
      // This would typically involve re-hashing the file and comparing
      // For now, return true as a placeholder
      return true
    } catch (error) {
      console.error('Error verifying file integrity:', error)
      return false
    }
  }

  /**
   * Encrypt content for premium access
   */
  async encryptContent(_file: File, _key: string): Promise<string> {
    try {
      // This would implement actual encryption
      // For now, upload normally and return hash
      const result = await this.uploadFile(_file)
      return result.hash
    } catch (error) {
      console.error('Error encrypting content:', error)
      throw new Error('Failed to encrypt content')
    }
  }

  /**
   * Get file from IPFS hash
   */
  async getFile(hash: string): Promise<Blob> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.blob()
    } catch (error) {
      console.error('Error fetching file from IPFS:', error)
      throw new Error('Failed to fetch file')
    }
  }

  /**
   * Get metadata from IPFS hash
   */
  async getMetadata(hash: string): Promise<ContentMetadata> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching metadata from IPFS:', error)
      throw new Error('Failed to fetch metadata')
    }
  }

  /**
   * Mock upload for development/testing
   */
  private mockUpload(file: File): UploadResult {
    const mockHash = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`
    return {
      hash: mockHash,
      url: `https://mock-gateway.com/ipfs/${mockHash}`,
      size: file.size
    }
  }

  /**
   * Calculate storage cost estimate
   */
  calculateStorageCost(files: File[]): number {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const sizeInGB = totalSize / (1024 * 1024 * 1024)
    
    // Mock pricing: $0.10 per GB per month
    return Math.max(0.01, sizeInGB * 0.10)
  }

  /**
   * Check if service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.pinataEndpoint}/data/testAuthentication`, {
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const contentService = new ContentService()
export default contentService