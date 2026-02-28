# KudoBit Backend API

**Decentralized Gumroad - Creator Marketplace on Blockchain**

A comprehensive REST API backend for the KudoBit platform, providing off-chain indexing, caching, social features, analytics, and Web2-friendly endpoints for the decentralized creator economy.

## 📊 Current Status

**Phase 1 & 2: COMPLETE** ✅
**Implementation:** 81% (51/63 features)

See [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for details.

---

## 🏗️ Architecture

This backend follows **clean architecture principles** with clear separation of concerns:

```
backend/
├── src/
│   ├── config/          # Database and environment configuration
│   │   ├── database.js           # PostgreSQL connection & schema
│   │   ├── schema-extensions.sql # Extended tables & triggers
│   │   └── env.js                # Environment variables
│   ├── middleware/      # Request/response middleware
│   │   ├── auth.js               # SIWE + JWT authentication
│   │   ├── validation.js         # Input validation
│   │   └── errorHandler.js       # Error handling
│   ├── models/          # Data access layer (8 models)
│   │   ├── creatorModel.js
│   │   ├── productModel.js
│   │   ├── purchaseModel.js
│   │   ├── categoryModel.js      # NEW
│   │   ├── tagModel.js           # NEW
│   │   ├── searchModel.js        # NEW
│   │   ├── reviewModel.js        # NEW
│   │   ├── wishlistModel.js      # NEW
│   │   ├── followModel.js        # NEW
│   │   ├── analyticsModel.js     # NEW
│   │   └── downloadModel.js      # NEW
│   ├── controllers/     # Business logic layer (8 controllers)
│   ├── routes/          # API route definitions (8 route files)
│   └── index.js         # Application entry point
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start PostgreSQL with Docker**
```bash
docker-compose up -d postgres
```

4. **Start the development server**
```bash
npm run dev
# or
npm start
```

The API will be available at:
- **API**: http://localhost:6000/api
- **Swagger Docs**: http://localhost:6000/docs
- **Health Check**: http://localhost:6000/health

---

## 🔌 API Endpoints

### 🔐 Authentication (SIWE)
- `GET /api/auth/nonce` - Generate authentication nonce
- `POST /api/auth/verify` - Verify SIWE signature and get JWT
- `POST /api/auth/logout` - Logout and invalidate session
- `GET /api/auth/me` - Get current user info

### 👤 Creators
- `GET /api/creators` - Get all creators
- `GET /api/creators/:address` - Get creator by address
- `GET /api/creators/:address/products` - Get creator's products
- `PUT /api/creators/profile` - Update creator profile [AUTH]

### 📦 Products
- `GET /api/products` - Get all products (supports ?creator=address filter)
- `POST /api/products` - Create product [AUTH]
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product [AUTH]
- `DELETE /api/products/:id` - Delete product [AUTH]

### 💰 Purchases
- `POST /api/purchases` - Record a purchase [AUTH]
- `GET /api/purchases` - Get user purchases [AUTH]
- `GET /api/purchases/:id` - Get purchase details [AUTH]
- `GET /api/purchases/:id/content` - Get content download URL [AUTH]

---

## 🆕 NEW ENDPOINTS (Phase 1 & 2)

### 🏷️ Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `GET /api/categories/:slug/products` - Get products in category

### 🔖 Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/popular` - Get popular tags (by usage)
- `GET /api/tags/:slug/products` - Get products with tag

### 🔍 Search & Discovery
- `POST /api/search` - Full-text search with filters
  ```json
  {
    "query": "string",
    "category": "number",
    "tags": ["number[]"],
    "minPrice": "number",
    "maxPrice": "number",
    "sortBy": "relevance|newest|price_asc|price_desc"
  }
  ```
- `GET /api/search/trending` - Get trending products
- `GET /api/search/featured` - Get featured products

### ⭐ Reviews & Ratings
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Create review [AUTH]
- `PUT /api/reviews/:id` - Update review [AUTH]
- `DELETE /api/reviews/:id` - Delete review [AUTH]
- `POST /api/reviews/:id/helpful` - Mark review helpful [AUTH]

### ❤️ Wishlist
- `GET /api/wishlist` - Get user's wishlist [AUTH]
- `POST /api/wishlist/:productId` - Add to wishlist [AUTH]
- `DELETE /api/wishlist/:productId` - Remove from wishlist [AUTH]
- `GET /api/wishlist/:productId/check` - Check if in wishlist [AUTH]

### 👥 Follow/Social
- `POST /api/creators/:address/follow` - Follow creator [AUTH]
- `DELETE /api/creators/:address/follow` - Unfollow creator [AUTH]
- `GET /api/creators/:address/followers` - Get creator's followers
- `GET /api/following` - Get creators user follows [AUTH]
- `GET /api/creators/:address/follow/check` - Check if following [AUTH]
- `GET /api/creators/:address/stats` - Get follower/following stats

### 📊 Analytics
- `GET /api/products/:id/analytics` - Get product analytics
- `POST /api/products/:id/view` - Track product view
- `GET /api/creators/:address/analytics` - Get creator analytics [AUTH, OWN]
- `GET /api/creators/:address/sales` - Get sales history [AUTH]
- `GET /api/creators/:address/revenue` - Get revenue over time [AUTH]
- `GET /api/creators/:address/top-products` - Get top products [AUTH]

### 📥 Downloads
- `POST /api/purchases/:id/download` - Create download link [AUTH]
- `GET /api/downloads/:token` - Download file (token-based)
- `GET /api/downloads` - Get download history [AUTH]
- `GET /api/products/:id/download-stats` - Get download stats

---

## 📚 Database Schema

### Core Tables
1. **creators** - Creator profiles
2. **products** - Digital products
3. **purchases** - Purchase records
4. **sessions** - User sessions

### Extended Tables (Phase 1 & 2)
5. **categories** - Product categories (10 seeded)
6. **tags** - Product tags (10 seeded)
7. **product_categories** - Many-to-many relationship
8. **product_tags** - Many-to-many relationship
9. **product_analytics** - View/download tracking
10. **downloads** - Secure download tokens
11. **reviews** - Product reviews & ratings
12. **review_helpful** - Review helpfulness votes
13. **wishlists** - User wishlists
14. **follows** - Creator follow relationships
15. **creator_analytics** - Aggregated creator stats

### Auto-Updating Triggers
- ✅ Auto-update creator analytics on purchase
- ✅ Auto-increment product views
- ✅ Auto-increment download counts
- ✅ Auto-update review helpful count
- ✅ Auto-update creator follower count
- ✅ Auto-update creator product count
- ✅ Auto-update creator average rating

---

## 📦 Environment Variables

Create a `.env` file with the following:

```env
# Application
NODE_ENV=development
PORT=6000

# Database (Docker defaults)
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_NAME=kudobit
DB_PORT=5434
DB_SSL=false

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# IPFS
IPFS_GATEWAY=gateway.pinata.cloud

# SIWE
SIWE_DOMAIN=localhost
SIWE_EMAIL_DOMAIN=kudobit.com
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View API logs
docker-compose logs -f api

# View database logs
docker-compose logs -f postgres

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

### Docker Services
- **postgres** - PostgreSQL database (port 5434)
- **api** - Node.js backend (port 6000)

---

## 🔐 Authentication

Uses **Sign-In with Ethereum (SIWE)** for wallet-based authentication:

### Flow
1. Frontend requests nonce: `GET /api/auth/nonce`
2. User signs SIWE message with wallet (e.g., MetaMask)
3. Frontend sends message + signature: `POST /api/auth/verify`
4. Backend verifies signature and returns JWT
5. Use JWT in `Authorization: Bearer <token>` header for protected routes

### Development Testing
For development, use the `X-Test-Address` header to bypass authentication:

```bash
curl http://localhost:6000/api/wishlist \
  -H "X-Test-Address: 0x742d35cc6634c0532925a3b844bc9e7595f0beb0"
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:6000/health
```

### Get Categories
```bash
curl http://localhost:6000/api/categories
```

### Search Products
```bash
curl -X POST http://localhost:6000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "art",
    "category": 1,
    "limit": 10,
    "sortBy": "newest"
  }'
```

### Get Trending Products
```bash
curl http://localhost:6000/api/search/trending
```

### Wishlist (with dev auth)
```bash
curl http://localhost:6000/api/wishlist \
  -H "X-Test-Address: 0x1234567890abcdef1234567890abcdef12345678"
```

---

## 📖 API Documentation

Interactive Swagger/OpenAPI documentation is available at:
**http://localhost:6000/docs**

---

## 🎯 Features

### ✅ Implemented
- SIWE wallet authentication
- Creator profiles & analytics
- Product CRUD operations
- Purchase tracking
- **Full-text search** with filters
- **Categories & tags**
- **Product reviews & ratings**
- **User wishlists**
- **Follow creators**
- **Creator analytics** (sales, revenue, followers)
- **Secure downloads** with token-based access
- **Auto-updating analytics** via database triggers

### 🚧 Coming Soon (Phase 3 & 4)
- DAO governance & voting
- Multi-creator revenue splits
- Multi-chain support
- Subscription models
- Referral/affiliate system

---

## 📝 License

MIT

---

**Built with ❤️ for the decentralized creator economy.**

For detailed implementation status, see [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)
