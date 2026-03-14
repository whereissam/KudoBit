import pg from 'pg'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class Database {
  pool: pg.Pool | null = null

  async init(): Promise<void> {
    const poolConfig: pg.PoolConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'kudobit',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }

    if (process.env.DB_PASSWORD !== undefined) {
      poolConfig.password = process.env.DB_PASSWORD
    }

    this.pool = new Pool(poolConfig)

    await this.createTables()
    console.log('✅ Database initialized')
  }

  async query(text: string, params: unknown[] = []): Promise<pg.QueryResult> {
    if (!this.pool) throw new Error('Database not initialized')
    return this.pool.query(text, params)
  }

  async createTables(): Promise<void> {
    await this.query(`
      CREATE TABLE IF NOT EXISTS creators (
        address VARCHAR(42) PRIMARY KEY,
        display_name TEXT,
        bio TEXT,
        social_links JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await this.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        address VARCHAR(42) PRIMARY KEY,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await this.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        creator_address VARCHAR(42) REFERENCES creators(address) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price_usdc DECIMAL(10,6) NOT NULL,
        ipfs_hash TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await this.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        buyer_address VARCHAR(42) NOT NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        price_usdc DECIMAL(10,6) NOT NULL,
        tx_hash VARCHAR(66) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await this.query(`CREATE INDEX IF NOT EXISTS idx_creators_address ON creators(address)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_products_creator ON products(creator_address)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_address)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id)`)

    await this.createExtendedSchema()
  }

  async createExtendedSchema(): Promise<void> {
    try {
      const schemaPath = join(__dirname, 'schema-extensions.sql')
      const schemaSql = readFileSync(schemaPath, 'utf-8')

      // Split SQL respecting $$ delimited function bodies.
      const statements: string[] = []
      let current = ''
      let inDollarQuote = false

      for (let i = 0; i < schemaSql.length; i++) {
        const char = schemaSql[i]

        if (char === '$' && schemaSql[i + 1] === '$') {
          inDollarQuote = !inDollarQuote
          current += '$$'
          i++
          continue
        }

        if (char === ';' && !inDollarQuote) {
          const trimmed = current.trim()
          if (trimmed.length > 0 && !trimmed.startsWith('--')) {
            statements.push(trimmed)
          }
          current = ''
        } else {
          current += char
        }
      }

      const remaining = current.trim()
      if (remaining.length > 0 && !remaining.startsWith('--')) {
        statements.push(remaining)
      }

      for (const statement of statements) {
        try {
          await this.query(statement)
        } catch (err) {
          console.error('⚠️ Schema statement failed:', (err as Error).message)
        }
      }

      console.log('✅ Extended schema initialized')
    } catch (error) {
      console.error('❌ Failed to create extended schema:', (error as Error).message)
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      console.log('Database connection closed')
    }
  }
}

export const db = new Database()
