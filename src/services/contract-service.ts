import {
  CONTRACTS,
  PRODUCT_NFT_ABI,
  CREATOR_REGISTRY_ABI,
  ROYALTY_MANAGER_ABI,
} from '../lib/contracts';

export interface ProductMetadata {
  name: string;
  description: string;
  image: string;
  price: string;
  category: string;
}

export class ContractService {
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

  getCreatorEarningsConfig(creatorAddress: `0x${string}`, tokenAddress: `0x${string}`) {
    return {
      address: CONTRACTS.royaltyManager,
      abi: ROYALTY_MANAGER_ABI,
      functionName: 'earnings',
      args: [creatorAddress, tokenAddress],
    } as const;
  }

  getClaimEarningsConfig(tokenAddress: `0x${string}`) {
    return {
      address: CONTRACTS.royaltyManager,
      abi: ROYALTY_MANAGER_ABI,
      functionName: 'claimEarnings',
      args: [tokenAddress],
    } as const;
  }
}

export const contractService = new ContractService();
