import { useState, useMemo, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ipfsService } from '../services/ipfs-service';
import { contractService, ProductMetadata } from '../services/contract-service';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  files: FileList;
  coverImage: File | null;
}

export function useCreator() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<Record<string, string>>({});
  
  const createProduct = useCallback(async (formData: ProductFormData) => {
    if (!address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      // 1. Upload cover image to IPFS
      let imageHash = '';
      if (formData.coverImage) {
        imageHash = await ipfsService.uploadFile(formData.coverImage);
      }
      
      // 2. Upload content files to IPFS
      const contentHashes: string[] = [];
      for (let i = 0; i < formData.files.length; i++) {
        const file = formData.files[i];
        const hash = await ipfsService.uploadFile(file);
        contentHashes.push(hash);
      }
      
      // 3. Create product metadata
      const metadata: ProductMetadata = {
        name: formData.name,
        description: formData.description,
        image: imageHash ? ipfsService.getFileURL(imageHash) : '',
        price: formData.price,
        category: formData.category,
      };
      
      // 4. Upload metadata to IPFS
      await ipfsService.uploadJSON(metadata);
      
      // 5. Return metadata for product creation (actual blockchain interaction should be done in the component using wagmi hooks)
      return { metadata, contentHash: contentHashes[0] };
    } finally {
      setIsLoading(false);
    }
  }, [address]);
  
  const loadCreatorData = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // Load creator products (this should be done with useReadContract in the component)
      // For now, return empty array
      setProducts([]);
      
      // Load earnings for common tokens
      const tokens = ['0x...USDC', '0x...WETH']; // Add actual token addresses
      const earningsData: Record<string, string> = {};
      
      for (const token of tokens) {
        const balance = await contractService.getCreatorEarnings();
        earningsData[token] = (balance as bigint).toString();
      }
      
      setEarnings(earningsData);
    } finally {
      setIsLoading(false);
    }
  }, [address]);
  
  const claimEarnings = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    try {
      await contractService.claimEarnings();
      await loadCreatorData(); // Refresh data
    } finally {
      setIsLoading(false);
    }
  }, [address, loadCreatorData]);
  
  return useMemo(() => ({
    createProduct,
    loadCreatorData,
    claimEarnings,
    products,
    earnings,
    isLoading,
    isCreator: !!address,
  }), [createProduct, loadCreatorData, claimEarnings, products, earnings, isLoading, address]);
}