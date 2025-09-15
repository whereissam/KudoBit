// API Documentation Framework
// Auto-generated OpenAPI specs and interactive documentation

import { z } from 'zod'

// OpenAPI Types
export interface OpenAPISpec {
  openapi: string
  info: Info
  servers: Server[]
  paths: Record<string, PathItem>
  components: Components
  security: SecurityRequirement[]
  tags: Tag[]
}

export interface Info {
  title: string
  description: string
  version: string
  termsOfService?: string
  contact?: Contact
  license?: License
}

export interface Contact {
  name?: string
  url?: string
  email?: string
}

export interface License {
  name: string
  url?: string
}

export interface Server {
  url: string
  description?: string
  variables?: Record<string, ServerVariable>
}

export interface ServerVariable {
  enum?: string[]
  default: string
  description?: string
}

export interface PathItem {
  summary?: string
  description?: string
  get?: Operation
  post?: Operation
  put?: Operation
  delete?: Operation
  options?: Operation
  head?: Operation
  patch?: Operation
  trace?: Operation
  parameters?: Parameter[]
}

export interface Operation {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses: Record<string, Response>
  security?: SecurityRequirement[]
  deprecated?: boolean
}

export interface Parameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  deprecated?: boolean
  allowEmptyValue?: boolean
  schema: Schema
}

export interface RequestBody {
  description?: string
  content: Record<string, MediaType>
  required?: boolean
}

export interface Response {
  description: string
  headers?: Record<string, Header>
  content?: Record<string, MediaType>
}

export interface MediaType {
  schema?: Schema
  example?: any
  examples?: Record<string, Example>
}

export interface Example {
  summary?: string
  description?: string
  value?: any
  externalValue?: string
}

export interface Header {
  description?: string
  required?: boolean
  deprecated?: boolean
  schema: Schema
}

export interface Components {
  schemas?: Record<string, Schema>
  responses?: Record<string, Response>
  parameters?: Record<string, Parameter>
  examples?: Record<string, Example>
  requestBodies?: Record<string, RequestBody>
  headers?: Record<string, Header>
  securitySchemes?: Record<string, SecurityScheme>
}

export interface Schema {
  type?: string
  format?: string
  title?: string
  description?: string
  enum?: any[]
  default?: any
  example?: any
  properties?: Record<string, Schema>
  required?: string[]
  items?: Schema
  allOf?: Schema[]
  oneOf?: Schema[]
  anyOf?: Schema[]
  not?: Schema
  additionalProperties?: boolean | Schema
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  $ref?: string
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  description?: string
  name?: string
  in?: 'query' | 'header' | 'cookie'
  scheme?: string
  bearerFormat?: string
  flows?: OAuthFlows
  openIdConnectUrl?: string
}

export interface OAuthFlows {
  implicit?: OAuthFlow
  password?: OAuthFlow
  clientCredentials?: OAuthFlow
  authorizationCode?: OAuthFlow
}

export interface OAuthFlow {
  authorizationUrl?: string
  tokenUrl?: string
  refreshUrl?: string
  scopes: Record<string, string>
}

export interface SecurityRequirement {
  [key: string]: string[]
}

export interface Tag {
  name: string
  description?: string
  externalDocs?: ExternalDocumentation
}

export interface ExternalDocumentation {
  description?: string
  url: string
}

// Documentation Generator
export class ApiDocumentationGenerator {
  private spec: OpenAPISpec

  constructor() {
    this.spec = this.createBaseSpec()
  }

  private createBaseSpec(): OpenAPISpec {
    return {
      openapi: '3.0.3',
      info: {
        title: 'KudoBit API',
        description: 'Enterprise-grade API for creator economy and digital perks platform',
        version: '1.0.0',
        termsOfService: 'https://kudobit.com/terms',
        contact: {
          name: 'KudoBit API Team',
          url: 'https://kudobit.com/support',
          email: 'api@kudobit.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'https://api.kudobit.com/v1',
          description: 'Production server'
        },
        {
          url: 'https://api-sandbox.kudobit.com/v1',
          description: 'Sandbox server'
        }
      ],
      paths: {},
      components: {
        schemas: this.createSchemas(),
        securitySchemes: this.createSecuritySchemes()
      },
      security: [
        { ApiKeyAuth: [] },
        { BearerAuth: [] }
      ],
      tags: this.createTags()
    }
  }

  private createSchemas(): Record<string, Schema> {
    return {
      Creator: {
        type: 'object',
        required: ['id', 'name', 'email', 'walletAddress'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique creator identifier',
            example: 'creator_123abc'
          },
          name: {
            type: 'string',
            description: 'Creator display name',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Creator email address',
            example: 'john@example.com'
          },
          walletAddress: {
            type: 'string',
            description: 'Blockchain wallet address',
            example: '0x742d35cc6634c0532925a3b8d5c9c9f4e2e5e7c3'
          },
          isVerified: {
            type: 'boolean',
            description: 'Whether the creator is verified',
            example: true
          },
          tier: {
            type: 'string',
            enum: ['basic', 'premium', 'enterprise'],
            description: 'Creator tier level',
            example: 'premium'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-01-15T10:30:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-01-15T10:30:00Z'
          }
        }
      },
      Perk: {
        type: 'object',
        required: ['id', 'creatorId', 'name', 'type', 'price', 'currency'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique perk identifier',
            example: 'perk_456def'
          },
          creatorId: {
            type: 'string',
            description: 'Creator who owns this perk',
            example: 'creator_123abc'
          },
          name: {
            type: 'string',
            description: 'Perk name',
            example: 'Exclusive Discord Access'
          },
          description: {
            type: 'string',
            description: 'Detailed perk description',
            example: 'Get access to our private Discord community'
          },
          type: {
            type: 'string',
            enum: ['digital', 'physical', 'experience'],
            description: 'Type of perk',
            example: 'digital'
          },
          price: {
            type: 'number',
            description: 'Perk price',
            example: 29.99
          },
          currency: {
            type: 'string',
            description: 'Price currency',
            example: 'USD'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the perk is available for purchase',
            example: true
          },
          totalSupply: {
            type: 'integer',
            description: 'Total number of perks available',
            example: 100
          },
          remainingSupply: {
            type: 'integer',
            description: 'Number of perks still available',
            example: 75
          },
          metadata: {
            type: 'object',
            additionalProperties: true,
            description: 'Additional perk metadata'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          }
        }
      },
      Purchase: {
        type: 'object',
        required: ['id', 'perkId', 'buyerId', 'amount', 'currency', 'status'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique purchase identifier',
            example: 'purchase_789ghi'
          },
          perkId: {
            type: 'string',
            description: 'ID of purchased perk',
            example: 'perk_456def'
          },
          buyerId: {
            type: 'string',
            description: 'ID of the buyer',
            example: 'user_999xyz'
          },
          amount: {
            type: 'number',
            description: 'Purchase amount',
            example: 29.99
          },
          currency: {
            type: 'string',
            description: 'Purchase currency',
            example: 'USD'
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
            description: 'Purchase status',
            example: 'confirmed'
          },
          transactionHash: {
            type: 'string',
            description: 'Blockchain transaction hash',
            example: '0xa1b2c3d4e5f6789...'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Purchase timestamp'
          }
        }
      },
      Error: {
        type: 'object',
        required: ['error', 'message'],
        properties: {
          error: {
            type: 'string',
            description: 'Error code',
            example: 'VALIDATION_ERROR'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message',
            example: 'The provided email is invalid'
          },
          details: {
            type: 'object',
            description: 'Additional error details'
          },
          requestId: {
            type: 'string',
            description: 'Unique request identifier for debugging',
            example: 'req_abc123def456'
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number',
            example: 1
          },
          limit: {
            type: 'integer',
            description: 'Items per page',
            example: 20
          },
          total: {
            type: 'integer',
            description: 'Total number of items',
            example: 150
          },
          pages: {
            type: 'integer',
            description: 'Total number of pages',
            example: 8
          }
        }
      }
    }
  }

  private createSecuritySchemes(): Record<string, SecurityScheme> {
    return {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'API key authentication. Format: `ApiKey {keyId}:{secret}`'
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token authentication'
      }
    }
  }

  private createTags(): Tag[] {
    return [
      {
        name: 'Creators',
        description: 'Creator management operations'
      },
      {
        name: 'Perks',
        description: 'Digital perk management'
      },
      {
        name: 'Purchases',
        description: 'Purchase and transaction operations'
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting'
      },
      {
        name: 'Webhooks',
        description: 'Webhook management'
      },
      {
        name: 'Authentication',
        description: 'Authentication and authorization'
      }
    ]
  }

  // Add API endpoints
  addEndpoint(path: string, method: string, operation: Operation): void {
    if (!this.spec.paths[path]) {
      this.spec.paths[path] = {}
    }
    
    const pathItem = this.spec.paths[path] as any
    pathItem[method.toLowerCase()] = operation
  }

  // Generate complete documentation
  generateCreatorEndpoints(): void {
    // GET /creators
    this.addEndpoint('/creators', 'GET', {
      tags: ['Creators'],
      summary: 'List creators',
      description: 'Retrieve a paginated list of creators',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: { type: 'integer', default: 1 }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: { type: 'integer', default: 20, maximum: 100 }
        },
        {
          name: 'tier',
          in: 'query',
          description: 'Filter by creator tier',
          schema: { type: 'string', enum: ['basic', 'premium', 'enterprise'] }
        },
        {
          name: 'verified',
          in: 'query',
          description: 'Filter by verification status',
          schema: { type: 'boolean' }
        }
      ],
      responses: {
        '200': {
          description: 'List of creators',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  creators: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Creator' }
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    })

    // POST /creators
    this.addEndpoint('/creators', 'POST', {
      tags: ['Creators'],
      summary: 'Create creator',
      description: 'Create a new creator account',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'walletAddress'],
              properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                walletAddress: { type: 'string', example: '0x742d35cc6634c0532925a3b8d5c9c9f4e2e5e7c3' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Creator created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Creator' }
            }
          }
        },
        '400': {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    })

    // GET /creators/{id}
    this.addEndpoint('/creators/{id}', 'GET', {
      tags: ['Creators'],
      summary: 'Get creator',
      description: 'Retrieve a specific creator by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Creator ID',
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Creator details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Creator' }
            }
          }
        },
        '404': {
          description: 'Creator not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    })
  }

  generatePerkEndpoints(): void {
    // Similar pattern for perks endpoints
    this.addEndpoint('/perks', 'GET', {
      tags: ['Perks'],
      summary: 'List perks',
      description: 'Retrieve a paginated list of perks',
      parameters: [
        {
          name: 'creatorId',
          in: 'query',
          description: 'Filter by creator ID',
          schema: { type: 'string' }
        },
        {
          name: 'type',
          in: 'query',
          description: 'Filter by perk type',
          schema: { type: 'string', enum: ['digital', 'physical', 'experience'] }
        },
        {
          name: 'isActive',
          in: 'query',
          description: 'Filter by active status',
          schema: { type: 'boolean' }
        }
      ],
      responses: {
        '200': {
          description: 'List of perks',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  perks: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Perk' }
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' }
                }
              }
            }
          }
        }
      }
    })
  }

  generatePurchaseEndpoints(): void {
    // Purchase endpoints
    this.addEndpoint('/purchases', 'POST', {
      tags: ['Purchases'],
      summary: 'Create purchase',
      description: 'Initiate a new purchase',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['perkId', 'buyerId', 'paymentMethod'],
              properties: {
                perkId: { type: 'string', example: 'perk_456def' },
                buyerId: { type: 'string', example: 'user_999xyz' },
                paymentMethod: { type: 'string', enum: ['crypto', 'fiat'], example: 'crypto' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Purchase created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Purchase' }
            }
          }
        }
      }
    })
  }

  // Generate complete OpenAPI spec
  generateFullSpec(): OpenAPISpec {
    this.generateCreatorEndpoints()
    this.generatePerkEndpoints()
    this.generatePurchaseEndpoints()
    
    return this.spec
  }

  // Export documentation in different formats
  exportAsJSON(): string {
    return JSON.stringify(this.generateFullSpec(), null, 2)
  }

  exportAsYAML(): string {
    // Simple YAML conversion (in production, use a proper YAML library)
    const spec = this.generateFullSpec()
    return this.objectToYAML(spec)
  }

  private objectToYAML(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent)
    let yaml = ''

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`
        yaml += this.objectToYAML(value, indent + 1)
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`
        for (const item of value) {
          if (typeof item === 'object') {
            yaml += `${spaces}- \n`
            yaml += this.objectToYAML(item, indent + 1)
          } else {
            yaml += `${spaces}- ${item}\n`
          }
        }
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`
      }
    }

    return yaml
  }

  // Generate interactive HTML documentation
  generateHTMLDocs(): string {
    const spec = this.generateFullSpec()
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>KudoBit API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api-spec.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`
  }
}

// Export instance and utilities
export const apiDocsGenerator = new ApiDocumentationGenerator()

export function generateSDKExamples(): Record<string, string> {
  return {
    javascript: `
// Initialize the SDK
import KudoBitSDK from '@kudobit/sdk'

const sdk = new KudoBitSDK({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
})

// Create a creator
const creator = await sdk.createCreator({
  name: 'John Doe',
  email: 'john@example.com',
  walletAddress: '0x742d35cc6634c0532925a3b8d5c9c9f4e2e5e7c3'
})

// Create a perk
const perk = await sdk.createPerk(creator.id, {
  name: 'Exclusive Discord Access',
  description: 'Get access to our private Discord community',
  type: 'digital',
  price: 29.99,
  currency: 'USD'
})

// List purchases
const purchases = await sdk.listPurchases({
  creatorId: creator.id,
  page: 1,
  limit: 20
})
`,
    python: `
# Install: pip install kudobit-sdk
from kudobit import KudoBitSDK

# Initialize the SDK
sdk = KudoBitSDK(
    api_key='your-api-key',
    environment='production'  # or 'sandbox'
)

# Create a creator
creator = sdk.create_creator({
    'name': 'John Doe',
    'email': 'john@example.com',
    'wallet_address': '0x742d35cc6634c0532925a3b8d5c9c9f4e2e5e7c3'
})

# Create a perk
perk = sdk.create_perk(creator['id'], {
    'name': 'Exclusive Discord Access',
    'description': 'Get access to our private Discord community',
    'type': 'digital',
    'price': 29.99,
    'currency': 'USD'
})

# List purchases
purchases = sdk.list_purchases(
    creator_id=creator['id'],
    page=1,
    limit=20
)
`,
    curl: `
# Create a creator
curl -X POST https://api.kudobit.com/v1/creators \\
  -H "Authorization: ApiKey your-key-id:your-secret" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "walletAddress": "0x742d35cc6634c0532925a3b8d5c9c9f4e2e5e7c3"
  }'

# Get creator
curl -X GET https://api.kudobit.com/v1/creators/creator_123abc \\
  -H "Authorization: ApiKey your-key-id:your-secret"

# List perks
curl -X GET "https://api.kudobit.com/v1/perks?creatorId=creator_123abc&page=1&limit=20" \\
  -H "Authorization: ApiKey your-key-id:your-secret"
`
  }
}