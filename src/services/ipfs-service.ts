// IPFS Service - Simple file upload/download via backend proxy
// Pinata API keys are stored server-side only.

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

export class IPFSService {
  private backendUrl: string

  constructor() {
    this.backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  }

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.backendUrl}/api/v1/ipfs/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS')
    }

    const result = await response.json()
    return result.hash
  }

  async uploadJSON(data: object): Promise<string> {
    const response = await fetch(`${this.backendUrl}/api/v1/ipfs/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to upload JSON to IPFS')
    }

    const result = await response.json()
    return result.hash
  }

  getFileURL(hash: string): string {
    return `${IPFS_GATEWAY}/${hash}`
  }
}

export const ipfsService = new IPFSService()
