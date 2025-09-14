import { PinataSDK } from 'pinata';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';

dotenv.config();

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'
});

// Supported file types for digital products
const SUPPORTED_FILE_TYPES = {
  // Documents
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  
  // Images
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  
  // Audio
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  
  // Video
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  
  // Archives
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  
  // Code/Text
  'application/json': '.json',
  'text/markdown': '.md',
  'text/html': '.html',
  'text/css': '.css',
  'application/javascript': '.js'
};

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export class IPFSService {
  
  static validateFile(file) {
    const errors = [];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Check file type
    if (!SUPPORTED_FILE_TYPES[file.mimetype]) {
      errors.push(`Unsupported file type: ${file.mimetype}`);
    }
    
    // Check file name
    if (!file.originalname || file.originalname.length > 255) {
      errors.push('Invalid file name');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static async uploadFile(file, metadata = {}) {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Generate unique filename to prevent conflicts
      const fileExtension = path.extname(file.originalname);
      const uniqueId = crypto.randomUUID();
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${uniqueId}${fileExtension}`;
      
      // Prepare file for upload
      const fileBuffer = file.buffer;
      
      // Upload to Pinata
      const uploadResult = await pinata.upload.buffer(fileBuffer, {
        name: uniqueFilename,
        metadata: {
          keyvalues: {
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size.toString(),
            uploadedBy: metadata.creatorAddress || 'unknown',
            uploadedAt: new Date().toISOString(),
            productId: metadata.productId || null,
            category: metadata.category || 'digital-product',
            ...metadata
          }
        }
      });
      
      return {
        success: true,
        ipfsHash: uploadResult.IpfsHash,
        pinataUrl: `https://${process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${uploadResult.IpfsHash}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        uniqueFilename
      };
      
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }
  
  static async uploadJSON(jsonData, filename, metadata = {}) {
    try {
      const jsonString = JSON.stringify(jsonData, null, 2);
      const buffer = Buffer.from(jsonString, 'utf8');
      
      // Generate unique filename
      const uniqueId = crypto.randomUUID();
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${uniqueId}-${filename}`;
      
      const uploadResult = await pinata.upload.buffer(buffer, {
        name: uniqueFilename,
        metadata: {
          keyvalues: {
            originalName: filename,
            mimeType: 'application/json',
            fileSize: buffer.length.toString(),
            uploadedBy: metadata.creatorAddress || 'unknown',
            uploadedAt: new Date().toISOString(),
            category: 'metadata',
            ...metadata
          }
        }
      });
      
      return {
        success: true,
        ipfsHash: uploadResult.IpfsHash,
        pinataUrl: `https://${process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${uploadResult.IpfsHash}`,
        originalName: filename,
        mimeType: 'application/json',
        fileSize: buffer.length,
        uniqueFilename
      };
      
    } catch (error) {
      console.error('JSON upload error:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }
  
  static async getFileInfo(ipfsHash) {
    try {
      // Get file metadata from Pinata
      const fileInfo = await pinata.gateways.get(ipfsHash);
      return fileInfo;
    } catch (error) {
      console.error('IPFS file info error:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }
  
  static async deleteFile(ipfsHash) {
    try {
      // Unpin file from Pinata (this removes it from your pinned files)
      await pinata.unpin([ipfsHash]);
      return { success: true };
    } catch (error) {
      console.error('IPFS delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
  
  static async listFiles(metadata = {}) {
    try {
      // List files with optional metadata filters
      const files = await pinata.listFiles({
        metadata: metadata,
        pageLimit: 100 // Adjust as needed
      });
      
      return files;
    } catch (error) {
      console.error('IPFS list files error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
  
  static generatePublicUrl(ipfsHash, gateway = null) {
    const gatewayUrl = gateway || process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';
    return `https://${gatewayUrl}/ipfs/${ipfsHash}`;
  }
  
  static getSupportedFileTypes() {
    return Object.keys(SUPPORTED_FILE_TYPES);
  }
  
  static getMaxFileSize() {
    return MAX_FILE_SIZE;
  }
}