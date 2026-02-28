import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: '24h' as const
  },

  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://localhost:5174']
  },

  ipfs: {
    gateway: process.env.IPFS_GATEWAY || 'gateway.pinata.cloud'
  },

  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'kudobit',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true'
  },

  siwe: {
    domain: process.env.SIWE_DOMAIN || 'localhost',
    emailDomain: process.env.SIWE_EMAIL_DOMAIN || 'kudobit.com'
  }
} as const
