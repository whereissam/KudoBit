import { writeContract, readContract } from '@wagmi/core';
import { config } from '../lib/wagmi';
import { 
  CONTRACTS, 
  PRODUCT_NFT_ABI, 
  CREATOR_REGISTRY_ABI
} from '../lib/contracts';

export interface ProductMetadata {
  name: string;
  description: string;
  image: string;
  price: string;
  category: string;
}

export class ContractService {
  async createProduct(metadata: ProductMetadata, contentHash: string) {
    // 1. Register creator if not already registered
    await this.registerCreator();
    
    // 2. Mint ProductNFT
    const productId = await writeContract(config, {
      address: CONTRACTS.productNFT,
      abi: PRODUCT_NFT_ABI,
      functionName: 'mintProduct',
      args: [metadata.name, metadata.description, metadata.image, BigInt(metadata.price), contentHash],
    });
    
    return productId;
  }
  
  async registerCreator() {
    try {
      await writeContract(config, {
        address: CONTRACTS.creatorRegistry,
        abi: CREATOR_REGISTRY_ABI,
        functionName: 'registerCreator',
        args: ['Creator Name', 'Creator Bio', 'https://example.com/avatar.jpg'],
      });
    } catch (error) {
      // Creator might already be registered
      console.log('Creator registration skipped:', error);
    }
  }
  
  async getCreatorProducts(creatorAddress: string) {
    try {
      const result = await readContract(config, {
        address: CONTRACTS.productNFT,
        abi: PRODUCT_NFT_ABI,
        functionName: 'getCreatorProducts',
        args: [creatorAddress as `0x${string}`],
      });
      return result || [];
    } catch (error: any) {
      // Handle case where creator has no products (returns 0x)
      if (error.message?.includes('returned no data') || error.message?.includes('0x')) {
        return [];
      }
      throw error;
    }
  }
  
  async getCreatorEarnings() {
    // Note: RoyaltyManager ABI not defined in contracts.ts yet
    // Return mock data for now
    return BigInt(0);
  }
  
  async claimEarnings() {
    // Note: RoyaltyManager ABI not defined in contracts.ts yet
    // Return mock transaction for now
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
}

export const contractService = new ContractService();