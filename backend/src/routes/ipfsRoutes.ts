import { Hono } from 'hono'
import type { AppEnv } from '../types/index.js'

const ipfsRoutes = new Hono<AppEnv>()

const PINATA_ENDPOINT = 'https://api.pinata.cloud'

function getPinataHeaders(): { pinata_api_key: string; pinata_secret_api_key: string } | null {
  const apiKey = process.env.PINATA_API_KEY
  const secretKey = process.env.PINATA_SECRET_KEY
  if (!apiKey || !secretKey) {
    return null
  }
  return {
    pinata_api_key: apiKey,
    pinata_secret_api_key: secretKey,
  }
}

// Upload file to IPFS
ipfsRoutes.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400)
  }

  const headers = getPinataHeaders()
  if (!headers) {
    return c.json({ error: 'IPFS service not configured — set PINATA_API_KEY and PINATA_SECRET_KEY' }, 503)
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${PINATA_ENDPOINT}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    return c.json({ error: 'IPFS upload failed', details: text }, 502)
  }

  const result = await response.json() as { IpfsHash: string }
  return c.json({ hash: result.IpfsHash })
})

// Upload JSON metadata to IPFS
ipfsRoutes.post('/metadata', async (c) => {
  const metadata = await c.req.json()

  const headers = getPinataHeaders()
  if (!headers) {
    return c.json({ error: 'IPFS service not configured — set PINATA_API_KEY and PINATA_SECRET_KEY' }, 503)
  }

  const response = await fetch(`${PINATA_ENDPOINT}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ pinataContent: metadata }),
  })

  if (!response.ok) {
    const text = await response.text()
    return c.json({ error: 'IPFS metadata upload failed', details: text }, 502)
  }

  const result = await response.json() as { IpfsHash: string }
  return c.json({ hash: result.IpfsHash })
})

export { ipfsRoutes }
