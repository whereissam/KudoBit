import { productService } from '../services/productService.js';
import { errorHandler } from '../utils/errorHandler.js';

export const productController = {
  createProduct: async (c) => {
    try {
      const user = c.get('user');
      const { productId, name, description, priceUsdc, ipfsContentHash, metadata } = await c.req.json();
      
      if (!productId || !name || !priceUsdc) {
        return errorHandler.badRequest(c, 'Product ID, name, and price are required');
      }
      
      const product = await productService.createProduct({
        creatorAddress: user.address,
        productId,
        name,
        description,
        priceUsdc,
        ipfsContentHash,
        metadata
      });

      return c.json({
        id: `prod_${product.id}`,
        object: 'product',
        productId: product.productId,
        name: product.name,
        description: product.description,
        priceUsdc: product.priceUsdc,
        ipfsContentHash: product.ipfsContentHash,
        isActive: product.isActive,
        creatorAddress: user.address,  
        created: Math.floor(new Date(product.created).getTime() / 1000)
      });
      
    } catch (error) {
      console.error('Create product error:', error);
      if (error.message.includes('already exists')) {
        return errorHandler.badRequest(c, error.message);
      }
      return errorHandler.internal(c, 'Product creation failed');
    }
  },

  getMyProducts: async (c) => {
    try {
      const user = c.get('user');
      const products = await productService.getProductsByCreator(user.address);
      
      return c.json({
        object: 'list',
        data: products.map(product => ({
          id: `prod_${product.id}`,
          object: 'product',
          productId: product.productId,
          name: product.name,
          description: product.description,
          priceUsdc: product.priceUsdc,
          ipfsContentHash: product.ipfsContentHash,
          isActive: product.isActive,
          created: Math.floor(new Date(product.created).getTime() / 1000),
          updated: Math.floor(new Date(product.updated).getTime() / 1000)
        })),
        has_more: false
      });
      
    } catch (error) {
      console.error('Get my products error:', error);
      return errorHandler.internal(c, 'Failed to fetch products');
    }
  },

  getCreatorProducts: async (c) => {
    try {
      const creatorAddress = c.req.param('address');
      const products = await productService.getProductsByCreator(creatorAddress);
      
      return c.json({
        object: 'list',
        data: products.map(product => ({
          id: `prod_${product.id}`,
          object: 'product',
          productId: product.productId,
          name: product.name,
          description: product.description,
          priceUsdc: product.priceUsdc,
          isActive: product.isActive,
          created: Math.floor(new Date(product.created).getTime() / 1000),
          updated: Math.floor(new Date(product.updated).getTime() / 1000)
        })),
        has_more: false
      });
      
    } catch (error) {
      console.error('Get creator products error:', error);
      return errorHandler.internal(c, 'Failed to fetch products');
    }
  },

  updateProductStatus: async (c) => {
    try {
      const user = c.get('user');
      const productId = parseInt(c.req.param('productId'));
      const { isActive } = await c.req.json();
      
      if (typeof isActive !== 'boolean') {
        return errorHandler.badRequest(c, 'isActive must be a boolean');
      }
      
      const updatedProduct = await productService.updateProductStatus(
        user.address,
        productId,
        isActive
      );
      
      if (!updatedProduct) {
        return errorHandler.notFound(c, 'Product not found or unauthorized');
      }

      return c.json({
        id: `prod_${updatedProduct.id}`,
        object: 'product',
        productId: updatedProduct.productId,
        name: updatedProduct.name,
        isActive: updatedProduct.isActive,
        updated: Math.floor(Date.now() / 1000)
      });
      
    } catch (error) {
      console.error('Update product status error:', error);
      return errorHandler.internal(c, 'Status update failed');
    }
  }
};