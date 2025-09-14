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
  // Contract interaction data structures for use with wagmi hooks
  getCreateProductConfig(metadata: ProductMetadata, contentHash: string) {
    return {
      address: CONTRACTS.productNFT,
      abi: PRODUCT_NFT_ABI,
      functionName: 'mintProduct',
      args: [metadata.name, metadata.description, metadata.image, BigInt(metadata.price), contentHash],
    } as const;
  }
  
  getRegisterCreatorConfig(name: string, bio: string, avatar: string) {
    return {
      address: CONTRACTS.creatorRegistry,
      abi: CREATOR_REGISTRY_ABI,
      functionName: 'registerCreator',
      args: [name, bio, avatar],
    } as const;
  }
  
  getCreatorProductsConfig(creatorAddress: string) {
    return {
      address: CONTRACTS.productNFT,
      abi: PRODUCT_NFT_ABI,
      functionName: 'getCreatorProducts',
      args: [creatorAddress as `0x${string}`],
    } as const;
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