# KudoBit API Documentation

Base URL: `http://localhost:5001/api`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

**Dev shortcut**: In development, use `X-Test-Address: 0x742d35cc6634c0532925a3b844bc9e7595f0beb0` header to bypass auth.

---

## Common Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "stack": "..." // Only in development
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad Request - Invalid input or missing required fields |
| `401` | Unauthorized - Missing or invalid JWT token |
| `403` | Forbidden - You don't have permission for this action |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate resource (e.g., duplicate review, duplicate tx_hash) |
| `500` | Internal Server Error |

---

## Health Check

### `GET /`

```json
// Response 200
{
  "name": "KudoBit API",
  "version": "2.0.0",
  "status": "healthy",
  "env": "development"
}
```

### `GET /health`

```json
// Response 200
{
  "status": "ok",
  "timestamp": "2026-02-28T12:00:00.000Z"
}
```

---

## Authentication

### `GET /api/auth/nonce`

Generate a SIWE nonce for wallet authentication.

**Auth**: None

```json
// Response 200
{
  "nonce": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
}
```

---

### `POST /api/auth/verify`

Verify SIWE signature and receive a JWT token.

**Auth**: None

**Request Body**:
```json
{
  "message": "localhost wants you to sign in with your Ethereum account:\n0x742d35Cc6634C0532925a3b844Bc9e7595F0bEb0\n\nSign in to KudoBit\n\nURI: http://localhost:5173\nVersion: 1\nChain ID: 1\nNonce: a1b2c3d4e5f6...\nIssued At: 2026-02-28T12:00:00.000Z",
  "signature": "0x..."
}
```

```json
// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
  "expiresAt": "2026-03-01T12:00:00.000Z"
}
```

```json
// Error 400
{ "error": "Missing message or signature" }

// Error 401
{ "error": "Invalid signature" }

// Error 500
{ "error": "Authentication failed" }
```

---

### `POST /api/auth/logout`

Invalidate current session.

**Auth**: Required

```json
// Response 200
{ "message": "Logged out successfully" }
```

```json
// Error 401
{ "error": "Authentication required" }
```

---

### `GET /api/auth/me`

Get current authenticated user profile.

**Auth**: Required

```json
// Response 200
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
  "display_name": "Alice",
  "bio": "Digital artist and creator",
  "social_links": { "twitter": "@alice" },
  "created_at": "2026-02-01T10:00:00.000Z",
  "updated_at": "2026-02-15T14:30:00.000Z"
}
```

```json
// Error 401
{ "error": "Not authenticated" }
```

---

## Creators

### `GET /api/creators`

List all creators.

**Auth**: None

```json
// Response 200
[
  {
    "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
    "display_name": "Alice",
    "bio": "Digital artist",
    "created_at": "2026-02-01T10:00:00.000Z"
  },
  {
    "address": "0xabc123...",
    "display_name": null,
    "bio": null,
    "created_at": "2026-02-10T08:00:00.000Z"
  }
]
```

---

### `GET /api/creators/:address`

Get a specific creator's profile.

**Auth**: None

**Params**: `address` - Ethereum address (42 chars)

```json
// Response 200
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
  "display_name": "Alice",
  "bio": "Digital artist and creator",
  "social_links": { "twitter": "@alice", "website": "https://alice.art" },
  "created_at": "2026-02-01T10:00:00.000Z",
  "updated_at": "2026-02-15T14:30:00.000Z"
}
```

```json
// Error 404
{ "error": "Creator not found" }
```

---

### `GET /api/creators/:address/products`

Get all products by a creator.

**Auth**: None

```json
// Response 200
[
  {
    "id": 1,
    "creator_address": "0x742d35cc...",
    "name": "Digital Art Pack",
    "description": "A collection of 10 digital illustrations",
    "price_usdc": "9.990000",
    "ipfs_hash": "QmXyz...",
    "is_active": true,
    "created_at": "2026-02-10T12:00:00.000Z",
    "updated_at": "2026-02-10T12:00:00.000Z"
  }
]
```

---

### `GET /api/creators/:address/stats`

Get creator statistics.

**Auth**: None

```json
// Response 200
{
  "creator": {
    "address": "0x742d35cc...",
    "display_name": "Alice",
    "bio": "Digital artist",
    "social_links": {},
    "created_at": "2026-02-01T10:00:00.000Z",
    "updated_at": "2026-02-15T14:30:00.000Z"
  },
  "stats": {
    "totalProducts": 5,
    "totalSales": 150.50,
    "totalPurchases": 12,
    "products": [ /* array of product objects */ ]
  }
}
```

```json
// Error 404
{ "error": "Creator not found" }
```

---

### `PUT /api/creators/profile`

Update authenticated creator's profile.

**Auth**: Required

**Request Body**:
```json
{
  "display_name": "Alice Updated",
  "bio": "New bio text",
  "social_links": {
    "twitter": "@alice",
    "website": "https://alice.art"
  }
}
```

All fields are optional. Only provided fields will be updated.

```json
// Response 200
{
  "address": "0x742d35cc...",
  "display_name": "Alice Updated",
  "bio": "New bio text",
  "social_links": { "twitter": "@alice", "website": "https://alice.art" },
  "created_at": "2026-02-01T10:00:00.000Z",
  "updated_at": "2026-02-28T12:00:00.000Z"
}
```

```json
// Error 400
{ "error": "Display name must be a string" }
{ "error": "Bio must be a string" }
{ "error": "Social links must be an object" }

// Error 401
{ "error": "Authentication required" }

// Error 500
{ "error": "Failed to update profile" }
```

---

## Products

### `GET /api/products`

List all active products.

**Auth**: None

**Query Params**:
| Param | Type | Description |
|-------|------|-------------|
| `creator` | string | Filter by creator address |

```json
// Response 200
[
  {
    "id": 1,
    "creator_address": "0x742d35cc...",
    "name": "Digital Art Pack",
    "description": "A collection of 10 digital illustrations",
    "price_usdc": "9.990000",
    "ipfs_hash": "QmXyz...",
    "is_active": true,
    "created_at": "2026-02-10T12:00:00.000Z",
    "updated_at": "2026-02-10T12:00:00.000Z"
  }
]
```

---

### `POST /api/products`

Create a new product.

**Auth**: Required

**Request Body**:
```json
{
  "name": "Digital Art Pack",
  "description": "A collection of 10 digital illustrations",
  "price_usdc": 9.99,
  "ipfs_hash": "QmXyz..."
}
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Product name (non-empty) |
| `price_usdc` | Yes | number | Price in USDC (> 0) |
| `description` | No | string | Product description |
| `ipfs_hash` | No | string | IPFS content hash |

```json
// Response 201
{
  "id": 1,
  "creator_address": "0x742d35cc...",
  "name": "Digital Art Pack",
  "description": "A collection of 10 digital illustrations",
  "price_usdc": "9.990000",
  "ipfs_hash": "QmXyz...",
  "is_active": true,
  "created_at": "2026-02-10T12:00:00.000Z",
  "updated_at": "2026-02-10T12:00:00.000Z"
}
```

```json
// Error 400
{ "error": "Product name is required" }
{ "error": "Valid price is required" }

// Error 401
{ "error": "Authentication required" }
```

---

### `GET /api/products/:id`

Get product by ID.

**Auth**: None

```json
// Response 200
{
  "id": 1,
  "creator_address": "0x742d35cc...",
  "name": "Digital Art Pack",
  "description": "A collection of 10 digital illustrations",
  "price_usdc": "9.990000",
  "ipfs_hash": "QmXyz...",
  "is_active": true,
  "created_at": "2026-02-10T12:00:00.000Z",
  "updated_at": "2026-02-10T12:00:00.000Z"
}
```

```json
// Error 404
{ "error": "Product not found" }
```

---

### `PUT /api/products/:id`

Update a product. Only the creator can update their own product.

**Auth**: Required

**Request Body** (all fields optional):
```json
{
  "name": "Updated Art Pack",
  "description": "Updated description",
  "price_usdc": 14.99,
  "ipfs_hash": "QmNewHash...",
  "is_active": false
}
```

```json
// Response 200
{
  "id": 1,
  "creator_address": "0x742d35cc...",
  "name": "Updated Art Pack",
  "description": "Updated description",
  "price_usdc": "14.990000",
  "ipfs_hash": "QmNewHash...",
  "is_active": false,
  "created_at": "2026-02-10T12:00:00.000Z",
  "updated_at": "2026-02-28T12:00:00.000Z"
}
```

```json
// Error 401
{ "error": "Authentication required" }

// Error 403
{ "error": "Unauthorized" }

// Error 404
{ "error": "Product not found" }
```

---

### `DELETE /api/products/:id`

Delete a product. Only the creator can delete their own product.

**Auth**: Required

```json
// Response 200
{ "message": "Product deleted successfully" }
```

```json
// Error 403
{ "error": "Unauthorized" }

// Error 404
{ "error": "Product not found" }
```

---

## Purchases

### `POST /api/purchases`

Record a new purchase (after on-chain transaction).

**Auth**: Required

**Request Body**:
```json
{
  "product_id": 1,
  "price_usdc": 9.99,
  "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| `product_id` | Yes | integer | Must reference existing product |
| `price_usdc` | Yes | number | Must be a valid number |
| `tx_hash` | Yes | string | Must match `^0x[a-fA-F0-9]{64}$` |

```json
// Response 201
{
  "id": 1,
  "buyer_address": "0xabc123...",
  "product_id": 1,
  "price_usdc": "9.990000",
  "tx_hash": "0x1234567890abcdef...",
  "created_at": "2026-02-28T12:00:00.000Z"
}
```

```json
// Error 400
{ "error": "Valid product ID is required" }
{ "error": "Valid price is required" }
{ "error": "Valid transaction hash is required" }

// Error 404
{ "error": "Product not found" }

// Error 409
{ "error": "Purchase already recorded" }
```

---

### `GET /api/purchases/buyer/:address`

Get all purchases by a buyer. Users can only view their own purchases.

**Auth**: Required

```json
// Response 200
[
  {
    "id": 1,
    "buyer_address": "0xabc123...",
    "product_id": 1,
    "price_usdc": "9.990000",
    "tx_hash": "0x1234...",
    "created_at": "2026-02-28T12:00:00.000Z",
    "product_name": "Digital Art Pack",
    "creator_address": "0x742d35cc...",
    "ipfs_hash": "QmXyz..."
  }
]
```

```json
// Error 403
{ "error": "Unauthorized" }
```

---

### `GET /api/purchases/content/:product_id`

Get download access for a purchased product.

**Auth**: Required

```json
// Response 200
{
  "product_id": 1,
  "ipfs_hash": "QmXyz...",
  "download_url": "https://gateway.pinata.cloud/ipfs/QmXyz...",
  "purchased_at": "2026-02-28T12:00:00.000Z"
}
```

```json
// Error 403
{ "error": "Purchase not found or unauthorized" }

// Error 404
{ "error": "No content available for this product" }
```

---

### `GET /api/purchases/verify/:address/:product_id`

Verify if an address has purchased a product.

**Auth**: None

```json
// Response 200 (purchased)
{
  "has_access": true,
  "purchase": {
    "id": 1,
    "buyer_address": "0xabc123...",
    "product_id": 1,
    "price_usdc": "9.990000",
    "tx_hash": "0x1234...",
    "created_at": "2026-02-28T12:00:00.000Z",
    "ipfs_hash": "QmXyz..."
  }
}

// Response 200 (not purchased)
{
  "has_access": false,
  "purchase": null
}
```

---

## Categories

### `GET /api/categories`

List all product categories.

**Auth**: None

```json
// Response 200
{
  "categories": [
    {
      "id": 1,
      "name": "Digital Art",
      "slug": "digital-art",
      "description": "Digital artwork, illustrations, and graphics",
      "created_at": "2026-02-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Music",
      "slug": "music",
      "description": "Music tracks, albums, and beats",
      "created_at": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

```json
// Error 500
{ "error": "Failed to fetch categories" }
```

---

### `GET /api/categories/:slug`

Get a category by slug with stats.

**Auth**: None

```json
// Response 200
{
  "category": {
    "id": 1,
    "name": "Digital Art",
    "slug": "digital-art",
    "description": "Digital artwork, illustrations, and graphics",
    "created_at": "2026-02-01T00:00:00.000Z",
    "product_count": "15",
    "creator_count": "8"
  }
}
```

```json
// Error 404
{ "error": "Category not found" }
```

---

### `GET /api/categories/:slug/products`

Get products in a category.

**Auth**: None

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 20 | Results per page |
| `offset` | integer | 0 | Pagination offset |

```json
// Response 200
{
  "products": [
    {
      "id": 1,
      "creator_address": "0x742d35cc...",
      "name": "Digital Art Pack",
      "description": "...",
      "price_usdc": "9.990000",
      "ipfs_hash": "QmXyz...",
      "is_active": true,
      "created_at": "2026-02-10T12:00:00.000Z",
      "updated_at": "2026-02-10T12:00:00.000Z",
      "creator_name": "Alice"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

```json
// Error 404
{ "error": "Category not found" }
```

---

## Tags

### `GET /api/tags`

List all tags.

**Auth**: None

```json
// Response 200
{
  "tags": [
    {
      "id": 1,
      "name": "Premium",
      "slug": "premium",
      "created_at": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/tags/popular`

Get tags sorted by usage count.

**Auth**: None

**Query Params**:
| Param | Type | Default |
|-------|------|---------|
| `limit` | integer | 20 |

```json
// Response 200
{
  "tags": [
    {
      "id": 1,
      "name": "Premium",
      "slug": "premium",
      "created_at": "2026-02-01T00:00:00.000Z",
      "product_count": "42"
    }
  ]
}
```

---

### `GET /api/tags/:slug/products`

Get products with a specific tag.

**Auth**: None

**Query Params**: `limit` (default 20), `offset` (default 0)

```json
// Response 200
{
  "products": [
    {
      "id": 1,
      "creator_address": "0x742d35cc...",
      "name": "Digital Art Pack",
      "price_usdc": "9.990000",
      "creator_name": "Alice",
      "..."
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "hasMore": false }
}
```

```json
// Error 404
{ "error": "Tag not found" }
```

---

## Search

### `POST /api/search`

Full-text search with filters.

**Auth**: None

**Request Body**:
```json
{
  "query": "digital art",
  "category": 1,
  "tags": [1, 2],
  "minPrice": 5.00,
  "maxPrice": 50.00,
  "sortBy": "relevance",
  "limit": 20,
  "offset": 0
}
```

| Field | Required | Type | Options |
|-------|----------|------|---------|
| `query` | Yes | string | Search text |
| `category` | No | integer | Category ID |
| `tags` | No | integer[] | Tag IDs |
| `minPrice` | No | number | Minimum price |
| `maxPrice` | No | number | Maximum price |
| `sortBy` | No | string | `relevance`, `newest`, `oldest`, `price_asc`, `price_desc`, `name` |
| `limit` | No | integer | Default: 20 |
| `offset` | No | integer | Default: 0 |

```json
// Response 200
{
  "products": [
    {
      "id": 1,
      "creator_address": "0x742d35cc...",
      "name": "Digital Art Pack",
      "description": "...",
      "price_usdc": "9.990000",
      "creator_name": "Alice",
      "rank": 0.6079
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

```json
// Error 500
{ "error": "Search failed" }
```

---

### `GET /api/search/trending`

Get trending products (most purchased/viewed recently).

**Auth**: None

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 20 | Max results |
| `days` | integer | 7 | Lookback period in days |

```json
// Response 200
{
  "products": [
    {
      "id": 1,
      "name": "Digital Art Pack",
      "price_usdc": "9.990000",
      "creator_name": "Alice",
      "view_count": 150,
      "purchase_count": "12"
    }
  ]
}
```

---

### `GET /api/search/featured`

Get featured products (highest rated with reviews).

**Auth**: None

**Query Params**: `limit` (default 10)

```json
// Response 200
{
  "products": [
    {
      "id": 1,
      "name": "Digital Art Pack",
      "price_usdc": "9.990000",
      "creator_name": "Alice",
      "avg_rating": "4.75",
      "review_count": "8"
    }
  ]
}
```

---

### `POST /api/products/:id/view`

Track a product page view.

**Auth**: None

```json
// Response 200
{ "success": true }
```

---

## Reviews

### `GET /api/products/:id/reviews`

Get reviews for a product.

**Auth**: None

**Query Params**:
| Param | Type | Default | Options |
|-------|------|---------|---------|
| `limit` | integer | 20 | |
| `offset` | integer | 0 | |
| `sortBy` | string | `newest` | `newest`, `oldest`, `highest`, `lowest`, `helpful` |

```json
// Response 200
{
  "reviews": [
    {
      "id": 1,
      "product_id": 1,
      "buyer_address": "0xabc123...",
      "purchase_id": 5,
      "rating": 5,
      "title": "Amazing quality!",
      "comment": "Love this art pack, highly recommended.",
      "is_verified_purchase": true,
      "helpful_count": 3,
      "created_at": "2026-02-20T10:00:00.000Z",
      "updated_at": "2026-02-20T10:00:00.000Z",
      "reviewer_name": "Bob"
    }
  ],
  "summary": {
    "total_reviews": "15",
    "avg_rating": "4.20",
    "five_star": "8",
    "four_star": "3",
    "three_star": "2",
    "two_star": "1",
    "one_star": "1"
  },
  "pagination": { "limit": 20, "offset": 0, "hasMore": false }
}
```

---

### `POST /api/products/:id/reviews`

Create a review for a product. One review per user per product.

**Auth**: Required

**Request Body**:
```json
{
  "rating": 5,
  "title": "Amazing quality!",
  "comment": "Love this art pack, highly recommended.",
  "purchaseId": 5
}
```

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| `rating` | Yes | integer | 1-5 |
| `title` | No | string | Review title |
| `comment` | No | string | Review text |
| `purchaseId` | No | integer | Links to purchase for verified badge |

```json
// Response 201
{
  "review": {
    "id": 1,
    "product_id": 1,
    "buyer_address": "0xabc123...",
    "purchase_id": 5,
    "rating": 5,
    "title": "Amazing quality!",
    "comment": "Love this art pack, highly recommended.",
    "is_verified_purchase": true,
    "helpful_count": 0,
    "created_at": "2026-02-28T12:00:00.000Z",
    "updated_at": "2026-02-28T12:00:00.000Z"
  }
}
```

```json
// Error 400
{ "error": "Rating must be between 1 and 5" }

// Error 409
{ "error": "You have already reviewed this product" }
```

---

### `PUT /api/reviews/:id`

Update your own review.

**Auth**: Required

**Request Body** (all optional):
```json
{
  "rating": 4,
  "title": "Updated title",
  "comment": "Updated comment"
}
```

```json
// Response 200
{
  "review": {
    "id": 1,
    "product_id": 1,
    "rating": 4,
    "title": "Updated title",
    "comment": "Updated comment",
    "updated_at": "2026-02-28T14:00:00.000Z"
  }
}
```

```json
// Error 403
{ "error": "Unauthorized" }

// Error 404
{ "error": "Review not found" }
```

---

### `DELETE /api/reviews/:id`

Delete your own review.

**Auth**: Required

```json
// Response 200
{ "success": true }
```

```json
// Error 403
{ "error": "Unauthorized" }

// Error 404
{ "error": "Review not found" }
```

---

### `POST /api/reviews/:id/helpful`

Mark a review as helpful. One vote per user per review.

**Auth**: Required

```json
// Response 200
{ "success": true }
```

---

## Wishlist

All wishlist endpoints require authentication.

### `GET /api/wishlist`

Get the authenticated user's wishlist.

**Auth**: Required

**Query Params**: `limit` (default 50), `offset` (default 0)

```json
// Response 200
{
  "items": [
    {
      "id": 1,
      "user_address": "0xabc123...",
      "product_id": 1,
      "created_at": "2026-02-25T10:00:00.000Z",
      "name": "Digital Art Pack",
      "description": "...",
      "price_usdc": "9.990000",
      "ipfs_hash": "QmXyz...",
      "is_active": true,
      "creator_name": "Alice"
    }
  ],
  "count": 3,
  "pagination": { "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### `POST /api/wishlist/:productId`

Add a product to wishlist.

**Auth**: Required

```json
// Response 201
{
  "item": {
    "id": 1,
    "user_address": "0xabc123...",
    "product_id": 1,
    "created_at": "2026-02-28T12:00:00.000Z"
  }
}
```

```json
// Error 500
{ "error": "Failed to add to wishlist" }
```

---

### `DELETE /api/wishlist/:productId`

Remove a product from wishlist.

**Auth**: Required

```json
// Response 200
{ "success": true }
```

---

### `GET /api/wishlist/:productId/check`

Check if a product is in the user's wishlist.

**Auth**: Required

```json
// Response 200
{ "isWishlisted": true }
```

---

## Follow / Social

### `POST /api/creators/:address/follow`

Follow a creator.

**Auth**: Required

```json
// Response 201
{
  "follow": {
    "id": 1,
    "follower_address": "0xabc123...",
    "creator_address": "0x742d35cc...",
    "created_at": "2026-02-28T12:00:00.000Z"
  }
}
```

```json
// Error 400
{ "error": "Cannot follow yourself" }
```

---

### `DELETE /api/creators/:address/follow`

Unfollow a creator.

**Auth**: Required

```json
// Response 200
{ "success": true }
```

---

### `GET /api/creators/:address/followers`

Get a creator's followers.

**Auth**: None

**Query Params**: `limit` (default 50), `offset` (default 0)

```json
// Response 200
{
  "followers": [
    {
      "follower_address": "0xabc123...",
      "display_name": "Bob",
      "bio": "Music producer",
      "created_at": "2026-02-20T10:00:00.000Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### `GET /api/following`

Get creators the authenticated user follows.

**Auth**: Required

**Query Params**: `limit` (default 50), `offset` (default 0)

```json
// Response 200
{
  "following": [
    {
      "creator_address": "0x742d35cc...",
      "display_name": "Alice",
      "bio": "Digital artist",
      "created_at": "2026-02-15T08:00:00.000Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### `GET /api/creators/:address/follow/check`

Check if you follow a creator.

**Auth**: Required

```json
// Response 200
{ "isFollowing": true }
```

---

## Analytics

### `GET /api/products/:id/analytics`

Get analytics for a product (views, downloads, revenue).

**Auth**: None

```json
// Response 200
{
  "analytics": {
    "product_id": 1,
    "view_count": 150,
    "download_count": 45,
    "total_purchases": "12",
    "total_revenue": "119.88",
    "avg_rating": "4.50",
    "review_count": "8"
  }
}
```

---

### `GET /api/creators/:address/analytics`

Get aggregated analytics for a creator. Only the creator can view their own analytics.

**Auth**: Required (own data only)

```json
// Response 200
{
  "analytics": {
    "creator_address": "0x742d35cc...",
    "total_sales": 45,
    "total_revenue_usdc": "499.500000",
    "total_products": 5,
    "total_followers": 23,
    "avg_rating": "4.30",
    "total_reviews": 18,
    "last_sale_at": "2026-02-27T15:00:00.000Z"
  }
}
```

```json
// Error 403
{ "error": "Unauthorized" }
```

---

### `GET /api/creators/:address/sales`

Get paginated sales history for a creator.

**Auth**: Required (own data only)

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 50 | Results per page |
| `offset` | integer | 0 | Pagination offset |
| `startDate` | string | - | ISO date filter start |
| `endDate` | string | - | ISO date filter end |

```json
// Response 200
{
  "sales": [
    {
      "id": 1,
      "buyer_address": "0xabc123...",
      "product_id": 1,
      "price_usdc": "9.990000",
      "tx_hash": "0x1234...",
      "created_at": "2026-02-28T12:00:00.000Z",
      "product_name": "Digital Art Pack"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "hasMore": false }
}
```

```json
// Error 403
{ "error": "Unauthorized" }
```

---

### `GET /api/creators/:address/revenue`

Get daily revenue data over time.

**Auth**: Required (own data only)

**Query Params**: `days` (default 30)

```json
// Response 200
{
  "data": [
    { "date": "2026-02-25", "sales": "3", "revenue": "29.97" },
    { "date": "2026-02-26", "sales": "1", "revenue": "9.99" },
    { "date": "2026-02-27", "sales": "5", "revenue": "49.95" }
  ]
}
```

```json
// Error 403
{ "error": "Unauthorized" }
```

---

### `GET /api/creators/:address/top-products`

Get best-selling products for a creator.

**Auth**: Required (own data only)

**Query Params**: `limit` (default 10)

```json
// Response 200
{
  "products": [
    {
      "id": 1,
      "name": "Digital Art Pack",
      "price_usdc": "9.990000",
      "total_sales": "12",
      "total_revenue": "119.88",
      "avg_rating": "4.50"
    }
  ]
}
```

```json
// Error 403
{ "error": "Unauthorized" }
```

---

## Downloads

### `POST /api/purchases/:id/download`

Create a secure download link for a purchased product. Links expire after 24 hours.

**Auth**: Required

```json
// Response 201
{
  "downloadUrl": "/api/downloads/a1b2c3d4e5f6...",
  "expiresAt": "2026-03-01T12:00:00.000Z"
}
```

```json
// Error 404
{ "error": "Purchase not found" }
```

---

### `GET /api/downloads/:token`

Download a file using a secure token. Token is single-use and time-limited.

**Auth**: None (token-based)

```json
// Response 200
{
  "ipfsHash": "QmXyz...",
  "productName": "Digital Art Pack",
  "gateway": "https://gateway.pinata.cloud/ipfs/"
}
```

```json
// Error 404
{ "error": "Invalid or expired download link" }
```

---

### `GET /api/downloads`

Get the authenticated user's download history.

**Auth**: Required

**Query Params**: `limit` (default 50), `offset` (default 0)

```json
// Response 200
{
  "downloads": [
    {
      "id": 1,
      "purchase_id": 5,
      "buyer_address": "0xabc123...",
      "product_id": 1,
      "download_url": "a1b2c3d4...",
      "expires_at": "2026-03-01T12:00:00.000Z",
      "downloaded_at": "2026-02-28T13:00:00.000Z",
      "created_at": "2026-02-28T12:00:00.000Z",
      "product_name": "Digital Art Pack",
      "ipfs_hash": "QmXyz..."
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### `GET /api/products/:id/download-stats`

Get download statistics for a product.

**Auth**: None

```json
// Response 200
{
  "stats": {
    "total_downloads": "25",
    "completed_downloads": "22",
    "unique_downloaders": "18"
  }
}
```
