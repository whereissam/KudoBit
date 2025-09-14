import { productModel } from '../models/productModel.js';

export const productService = {
  createProduct: async (productData) => {
    const {
      creatorAddress,
      productId,
      name,
      description,
      priceUsdc,
      ipfsContentHash,
      metadata
    } = productData;

    const existingProducts = await productModel.findByCreator(creatorAddress);
    const existingProduct = existingProducts.find(p => p.product_id === productId);
    
    if (existingProduct) {
      throw new Error('Product with this ID already exists');
    }

    const product = await productModel.create(
      creatorAddress,
      productId,
      name,
      description || '',
      priceUsdc,
      ipfsContentHash || null
    );

    return {
      id: product.id,
      productId: product.product_id,
      name: product.name,
      description: product.description,
      priceUsdc: product.price_usdc,
      ipfsContentHash: product.ipfs_content_hash,
      isActive: product.is_active,
      created: product.created_at
    };
  },

  getProductsByCreator: async (creatorAddress) => {
    const products = await productModel.findByCreator(creatorAddress);
    
    return products.map(product => ({
      id: product.id,
      productId: product.product_id,
      name: product.name,
      description: product.description,
      priceUsdc: product.price_usdc,
      ipfsContentHash: product.ipfs_content_hash,
      isActive: product.is_active,
      created: product.created_at,
      updated: product.updated_at
    }));
  },

  updateProductStatus: async (creatorAddress, productId, isActive) => {
    const updatedProduct = await productModel.updateStatus(
      creatorAddress,
      productId,
      isActive
    );

    if (!updatedProduct) return null;

    return {
      id: updatedProduct.id,
      productId: updatedProduct.product_id,
      name: updatedProduct.name,
      isActive: updatedProduct.is_active
    };
  }
};