import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'KudoBit API',
    version: '1.0.0',
    description: 'A Stripe-style RESTful API for KudoBit creator platform built with Web3 authentication',
    contact: {
      name: 'KudoBit Team',
      email: 'support@kudobit.com'
    },
    license: {
      name: 'ISC'
    }
  },
  servers: [
    {
      url: 'http://localhost:4500/v1',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from SIWE authentication'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['validation_error', 'authentication_error', 'api_error'],
                description: 'Error type category'
              },
              message: {
                type: 'string',
                description: 'Human-readable error message'
              }
            },
            required: ['type', 'message']
          }
        }
      },
      Creator: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Wallet address (unique identifier)',
            example: '0x742d35Cc6435C426FD4a4b5421e0B65dC55bd0E7'
          },
          object: {
            type: 'string',
            enum: ['creator'],
            description: 'Object type'
          },
          address: {
            type: 'string',
            description: 'Ethereum wallet address',
            example: '0x742d35Cc6435C426FD4a4b5421e0B65dC55bd0E7'
          },
          displayName: {
            type: 'string',
            description: 'Creator display name',
            example: 'Alice Cooper'
          },
          bio: {
            type: 'string',
            description: 'Creator biography',
            example: 'Digital artist and NFT creator'
          },
          socialLinks: {
            type: 'object',
            description: 'Social media links',
            example: {
              twitter: 'https://twitter.com/alicecooper',
              instagram: 'https://instagram.com/alicecooper'
            }
          },
          isVerified: {
            type: 'boolean',
            description: 'Verification status'
          },
          created: {
            type: 'integer',
            description: 'UNIX timestamp of creation',
            example: 1720000000
          }
        },
        required: ['id', 'object', 'address', 'created']
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Product identifier',
            example: 'prod_123'
          },
          object: {
            type: 'string',
            enum: ['product'],
            description: 'Object type'
          },
          productId: {
            type: 'integer',
            description: 'Numeric product ID',
            example: 1
          },
          name: {
            type: 'string',
            description: 'Product name',
            example: 'Exclusive Digital Art NFT'
          },
          description: {
            type: 'string',
            description: 'Product description',
            example: 'A unique digital artwork with exclusive creator access'
          },
          priceUsdc: {
            type: 'string',
            description: 'Price in USDC',
            example: '10.50'
          },
          ipfsContentHash: {
            type: 'string',
            nullable: true,
            description: 'IPFS hash for digital content',
            example: 'QmX7Z8K9L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether product is active for sale'
          },
          creatorAddress: {
            type: 'string',
            description: 'Creator wallet address',
            example: '0x742d35Cc6435C426FD4a4b5421e0B65dC55bd0E7'
          },
          created: {
            type: 'integer',
            description: 'UNIX timestamp of creation',
            example: 1720000000
          },
          updated: {
            type: 'integer',
            description: 'UNIX timestamp of last update',
            example: 1720003600
          }
        },
        required: ['id', 'object', 'productId', 'name', 'priceUsdc', 'isActive', 'created']
      },
      ListResponse: {
        type: 'object',
        properties: {
          object: {
            type: 'string',
            enum: ['list'],
            description: 'Object type'
          },
          data: {
            type: 'array',
            description: 'Array of objects'
          },
          has_more: {
            type: 'boolean',
            description: 'Whether there are more items available'
          }
        },
        required: ['object', 'data', 'has_more']
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ['./routes/v1/*.js', './controllers/*.js'], // Path to the API files
};

export const swaggerSpec = swaggerJSDoc(options);