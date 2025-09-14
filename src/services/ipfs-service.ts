// IPFS Service - Simple file upload/download
export class IPFSService {
  private pinataApiKey = process.env.VITE_PINATA_API_KEY;
  private pinataSecretKey = process.env.VITE_PINATA_SECRET_KEY;
  
  async uploadFile(file: File): Promise<string> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('IPFS credentials not configured');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }
    
    const result = await response.json();
    return result.IpfsHash;
  }
  
  async uploadJSON(data: object): Promise<string> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('IPFS credentials not configured');
    }
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload JSON to IPFS');
    }
    
    const result = await response.json();
    return result.IpfsHash;
  }
  
  getFileURL(hash: string): string {
    return `https://ipfs.io/ipfs/${hash}`;
  }
}

export const ipfsService = new IPFSService();