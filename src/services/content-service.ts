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

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

class ContentService {
  private backendUrl: string

  constructor() {
    this.backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  }

  /**
   * Upload single file to IPFS via backend proxy
   * The backend holds the Pinata API keys — never the client.
   */
  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)

    const response = await fetch(`${this.backendUrl}/api/v1/ipfs/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    const result = await response.json()

    return {
      hash: result.hash,
      url: `${IPFS_GATEWAY}/${result.hash}`,
      size: file.size,
    }
  }

  /**
   * Upload multiple files to IPFS
   */
  async uploadFiles(files: File[]): Promise<UploadResult[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)))
  }

  /**
   * Upload JSON metadata to IPFS via backend proxy
   */
  async uploadMetadata(metadata: ContentMetadata): Promise<UploadResult> {
    const response = await fetch(`${this.backendUrl}/api/v1/ipfs/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      throw new Error(`Metadata upload failed: ${response.status}`)
    }

    const result = await response.json()
    const metadataStr = JSON.stringify(metadata)

    return {
      hash: result.hash,
      url: `${IPFS_GATEWAY}/${result.hash}`,
      size: new Blob([metadataStr]).size,
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
    const [imageResults, productFileResults, previewFileResults] =
      await Promise.all([
        this.uploadFiles(images),
        this.uploadFiles(productFiles),
        previewFiles.length > 0
          ? this.uploadFiles(previewFiles)
          : Promise.resolve([]),
      ])

    const metadata: ContentMetadata = {
      name,
      description,
      image: imageResults[0]?.url || '',
      files: [
        ...productFileResults.map((result, index) => ({
          name: productFiles[index].name,
          hash: result.hash,
          size: result.size,
          type: 'product',
        })),
        ...previewFileResults.map((result, index) => ({
          name: previewFiles[index].name,
          hash: result.hash,
          size: result.size,
          type: 'preview',
        })),
        ...imageResults.slice(1).map((result, index) => ({
          name: images[index + 1].name,
          hash: result.hash,
          size: result.size,
          type: 'image',
        })),
      ],
    }

    const metadataResult = await this.uploadMetadata(metadata)
    return metadataResult.hash
  }

  /**
   * Get file from IPFS hash
   */
  async getFile(hash: string): Promise<Blob> {
    const response = await fetch(`${IPFS_GATEWAY}/${hash}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`)
    }
    return response.blob()
  }

  /**
   * Get metadata from IPFS hash
   */
  async getMetadata(hash: string): Promise<ContentMetadata> {
    const response = await fetch(`${IPFS_GATEWAY}/${hash}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`)
    }
    return response.json()
  }
}

export const contentService = new ContentService()
export default contentService
