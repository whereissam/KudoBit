# Creator Flow Specification

## 🎯 Overview
The creator flow is the backbone of our onchain Gumroad platform. This document details every step of the creator journey from registration to earnings withdrawal.

## 👤 Creator Journey Map

```
Registration → Profile Setup → Product Creation → Content Upload → 
Pricing & Distribution → Launch → Sales Management → Analytics → Earnings
```

## 📋 Detailed Creator Flow Functions

### 1. 🚀 Creator Onboarding Flow

#### 1.1 Registration & Wallet Connection
**Route**: `/creator/register`
**Smart Contract**: `CreatorRegistry.sol`

```typescript
// Frontend Function
const registerCreator = async (profile: CreatorProfile) => {
  // 1. Verify wallet connection
  // 2. Sign registration message
  // 3. Call contract registration
  // 4. Store profile metadata to IPFS
  // 5. Update local state
}
```

**Creator Profile Structure**:
```solidity
struct CreatorProfile {
    string name;                    // Display name
    string bio;                     // Creator biography
    string avatar;                  // IPFS hash for profile image
    string banner;                  // IPFS hash for banner image
    string website;                 // External website
    string[] socialLinks;           // Social media links
    string[] categories;            // Creator's main categories
    bool isVerified;               // Verification status
    uint256 createdAt;             // Registration timestamp
}
```

**Functions to Implement**:
- [ ] `WalletConnectionModal.tsx`
- [ ] `CreatorRegistrationForm.tsx`
- [ ] `ProfileImageUpload.tsx`
- [ ] `SocialLinksManager.tsx`
- [ ] `CategorySelector.tsx`

#### 1.2 Creator Verification
**Route**: `/creator/verification`
**Smart Contract**: `CreatorRegistry.sol`

```solidity
function requestVerification(bytes32 identityHash, string calldata evidence) external
function verifyCreator(address creator, bool approved) external onlyAdmin
```

**Verification Process**:
1. Identity verification (KYC-lite)
2. Social media verification
3. Portfolio review
4. Admin approval

**Functions to Implement**:
- [ ] `VerificationForm.tsx`
- [ ] `IdentityUpload.tsx` 
- [ ] `SocialProofChecker.tsx`
- [ ] `VerificationStatus.tsx`

### 2. 📦 Product Creation Flow

#### 2.1 Product Information Setup
**Route**: `/creator/products/new`
**Smart Contract**: `ProductNFT.sol`, `GumroadCore.sol`

```typescript
interface ProductMetadata {
  name: string;                    // Product title
  description: string;             // Detailed description  
  shortDescription: string;        // Brief summary
  category: string;                // Main category
  tags: string[];                  // Searchable tags
  images: string[];               // Product images (IPFS hashes)
  previewFiles: string[];         // Preview content
  productFiles: string[];         // Main product files
  requirements: string;           // System requirements
  version: string;                // Product version
  license: string;                // Usage license
}
```

**Functions to Implement**:
- [ ] `ProductBasicInfoForm.tsx`
- [ ] `ProductDescriptionEditor.tsx` (Rich text editor)
- [ ] `CategoryTagSelector.tsx`
- [ ] `ProductImageGallery.tsx`
- [ ] `PreviewFileUpload.tsx`

#### 2.2 Content Upload & Management
**Route**: `/creator/products/new/upload`
**Service**: `ContentService.ts`

```typescript
class ContentService {
  // Upload main product files
  async uploadProductFiles(files: File[]): Promise<string[]>
  
  // Upload preview files (free samples)
  async uploadPreviewFiles(files: File[]): Promise<string[]>
  
  // Upload product images
  async uploadProductImages(images: File[]): Promise<string[]>
  
  // Verify file integrity
  async verifyFileIntegrity(hash: string): Promise<boolean>
  
  // Encrypt premium content
  async encryptContent(file: File, key: string): Promise<string>
}
```

**File Types Supported**:
- **Digital Art**: PNG, JPG, SVG, PSD, AI, SKETCH
- **Videos**: MP4, MOV, AVI, WEBM
- **Audio**: MP3, WAV, FLAC, M4A
- **Documents**: PDF, DOCX, EPUB
- **Software**: ZIP, RAR, DMG, EXE
- **3D Models**: OBJ, FBX, BLEND, STL
- **Fonts**: TTF, OTF, WOFF, WOFF2

**Functions to Implement**:
- [ ] `FileUploadZone.tsx`
- [ ] `FiletypeValidator.tsx`
- [ ] `UploadProgress.tsx`
- [ ] `FilePreviewManager.tsx`
- [ ] `ContentEncryption.tsx`

#### 2.3 Pricing & Distribution Setup
**Route**: `/creator/products/new/pricing`
**Smart Contract**: `GumroadCore.sol`

```solidity
struct PricingConfig {
    uint256 basePrice;              // Base price in wei
    address[] acceptedTokens;       // Supported payment tokens
    uint256[] tokenPrices;          // Price in each token
    bool isDynamicPricing;          // Enable demand-based pricing
    uint256 discountPercentage;     // Bulk discount percentage
    uint256 minimumPurchase;        // Minimum purchase quantity
    bool allowResale;               // Enable secondary market
    uint256 royaltyPercentage;      // Creator royalty on resales
}
```

**Pricing Models**:
1. **Fixed Price**: Set price in multiple currencies
2. **Dynamic Pricing**: Price changes based on demand
3. **Tiered Pricing**: Bulk purchase discounts
4. **Subscription**: Recurring access fees
5. **Pay-What-You-Want**: Minimum price with optional extra
6. **Auction**: Bidding mechanism for limited editions

**Functions to Implement**:
- [ ] `PricingModelSelector.tsx`
- [ ] `MultiCurrencyPricer.tsx`
- [ ] `DynamicPricingConfig.tsx`
- [ ] `RoyaltySettings.tsx`
- [ ] `DiscountManager.tsx`

### 3. 🎪 Product Launch Flow

#### 3.1 Pre-Launch Checklist
**Route**: `/creator/products/new/launch`

**Launch Requirements**:
- [ ] Product metadata complete
- [ ] All files uploaded and verified
- [ ] Pricing configured
- [ ] Preview content available
- [ ] Legal compliance checked
- [ ] Smart contract deployment ready

**Functions to Implement**:
- [ ] `LaunchChecklist.tsx`
- [ ] `ProductPreview.tsx`
- [ ] `LaunchScheduler.tsx`
- [ ] `MarketingTools.tsx`

#### 3.2 Smart Contract Deployment
**Smart Contract Function**:
```solidity
function createProduct(
    ProductMetadata calldata metadata,
    PricingConfig calldata pricing,
    string calldata contentHash,
    bytes calldata encryptionKey
) external returns (uint256 productId)
```

**Deployment Process**:
1. Validate all product data
2. Upload metadata to IPFS
3. Deploy product NFT
4. Set pricing configuration
5. Enable product for sale
6. Emit ProductCreated event

**Functions to Implement**:
- [ ] `ContractDeployer.tsx`
- [ ] `TransactionMonitor.tsx`
- [ ] `DeploymentStatus.tsx`
- [ ] `GasEstimator.tsx`

### 4. 📊 Sales Management Flow

#### 4.1 Sales Dashboard
**Route**: `/creator/dashboard`
**Smart Contract**: `GumroadCore.sol`

```typescript
interface SalesMetrics {
  totalSales: number;              // Total sales count
  totalRevenue: bigint;            // Total revenue in wei
  revenueByToken: Map<string, bigint>; // Revenue by token type
  salesByDay: SalesDataPoint[];    // Daily sales data
  topProducts: Product[];          // Best-selling products
  customerCount: number;           // Unique customers
  averageOrderValue: bigint;       // Average purchase amount
  conversionRate: number;          // View-to-purchase ratio
}
```

**Functions to Implement**:
- [ ] `SalesDashboard.tsx`
- [ ] `RevenueChart.tsx`
- [ ] `ProductPerformanceTable.tsx`
- [ ] `CustomerAnalytics.tsx`
- [ ] `ConversionFunnel.tsx`

#### 4.2 Order Management
**Route**: `/creator/orders`

```typescript
interface Order {
  id: string;                      // Order ID
  buyer: string;                   // Buyer wallet address
  productId: number;               // Product NFT ID
  quantity: number;                // Purchase quantity
  totalAmount: bigint;             // Total paid amount
  paymentToken: string;            // Payment token address
  status: OrderStatus;             // Order status
  purchaseDate: Date;              // Purchase timestamp
  downloadCount: number;           // Number of downloads
  lastDownload: Date;              // Last download time
}
```

**Functions to Implement**:
- [ ] `OrdersList.tsx`
- [ ] `OrderDetail.tsx`
- [ ] `OrderFilters.tsx`
- [ ] `BuyerProfile.tsx`
- [ ] `OrderExport.tsx`

#### 4.3 Customer Communication
**Route**: `/creator/customers`

**Communication Features**:
- Direct messaging with buyers
- Bulk announcements
- Product update notifications
- Support ticket system

**Functions to Implement**:
- [ ] `CustomerList.tsx`
- [ ] `MessageCenter.tsx`
- [ ] `BulkNotifications.tsx`
- [ ] `SupportTickets.tsx`

### 5. 💰 Revenue Management Flow

#### 5.1 Earnings Overview
**Route**: `/creator/earnings`
**Smart Contract**: `RoyaltyManager.sol`

```solidity
struct EarningsData {
    uint256 totalEarned;            // Total earnings ever
    uint256 availableBalance;       // Available to withdraw
    uint256 pendingBalance;         // Pending from recent sales
    uint256 totalWithdrawn;         // Already withdrawn amount
    mapping(address => uint256) tokenBalances; // Balance by token
    uint256 lastWithdrawal;         // Last withdrawal timestamp
}
```

**Revenue Streams**:
1. **Primary Sales**: Direct product sales
2. **Royalties**: Secondary market sales
3. **Creator Tokens**: Fan token sales
4. **Subscriptions**: Recurring payments
5. **Tips/Donations**: Additional support from fans

**Functions to Implement**:
- [ ] `EarningsOverview.tsx`
- [ ] `RevenueStreams.tsx`
- [ ] `WithdrawalInterface.tsx`
- [ ] `TaxReporting.tsx`
- [ ] `PaymentHistory.tsx`

#### 5.2 Withdrawal Management
**Route**: `/creator/earnings/withdraw`

```solidity
function withdrawEarnings(
    address token,
    uint256 amount,
    address recipient
) external nonReentrant
```

**Withdrawal Features**:
- Multi-token withdrawals
- Batch withdrawals
- Scheduled withdrawals
- Gas optimization
- Tax calculation helpers

**Functions to Implement**:
- [ ] `WithdrawalForm.tsx`
- [ ] `TokenSelector.tsx`
- [ ] `GasOptimizer.tsx`
- [ ] `WithdrawalHistory.tsx`
- [ ] `TaxCalculator.tsx`

### 6. 📈 Analytics & Insights Flow

#### 6.1 Product Analytics
**Route**: `/creator/analytics/products`

```typescript
interface ProductAnalytics {
  productId: number;
  views: number;                   // Product page views
  conversions: number;             // Purchases
  conversionRate: number;          // View-to-purchase ratio
  revenue: bigint;                 // Total revenue
  refunds: number;                 // Refund count
  ratings: number;                 // Average rating
  reviewCount: number;             // Total reviews
  downloadCount: number;           // Total downloads
  shareCount: number;              // Social shares
}
```

**Analytics Features**:
- Product performance comparison
- Traffic source analysis
- Customer demographic insights
- Seasonal trends analysis
- Competitor benchmarking

**Functions to Implement**:
- [ ] `ProductAnalyticsDashboard.tsx`
- [ ] `PerformanceComparison.tsx`
- [ ] `TrafficSources.tsx`
- [ ] `CustomerDemographics.tsx`
- [ ] `TrendAnalysis.tsx`

#### 6.2 Marketing Insights
**Route**: `/creator/analytics/marketing`

```typescript
interface MarketingMetrics {
  organicTraffic: number;          // Direct/organic visits
  socialTraffic: number;           // Social media referrals
  searchTraffic: number;           // Search engine traffic
  emailTraffic: number;            // Email campaign traffic
  paidTraffic: number;             // Paid advertising traffic
  conversionBySource: Map<string, number>; // Conversion by traffic source
  customerAcquisitionCost: number; // CAC by channel
  lifetimeValue: number;           // Customer LTV
}
```

**Functions to Implement**:
- [ ] `MarketingDashboard.tsx`
- [ ] `TrafficAnalytics.tsx`
- [ ] `ConversionTracking.tsx`
- [ ] `CampaignPerformance.tsx`
- [ ] `ROICalculator.tsx`

### 7. 🛠 Advanced Creator Tools

#### 7.1 Creator Token Management
**Route**: `/creator/tokens`
**Smart Contract**: `CreatorToken.sol`

```solidity
contract CreatorToken is ERC20 {
    function mint(uint256 amount) external onlyCreator
    function setTokenPrice(uint256 price) external onlyCreator
    function enableStaking(uint256 rewards) external onlyCreator
    function grantTokenAccess(uint256 productId) external onlyCreator
}
```

**Token Features**:
- Issue personal creator tokens
- Token-gated content access
- Fan token staking rewards
- Token-based voting/governance
- Community building tools

**Functions to Implement**:
- [ ] `TokenDashboard.tsx`
- [ ] `TokenIssuance.tsx`
- [ ] `TokenGatedContent.tsx`
- [ ] `CommunityGovernance.tsx`
- [ ] `StakingRewards.tsx`

#### 7.2 Collaboration Tools
**Route**: `/creator/collaborations`

```typescript
interface Collaboration {
  collaborators: string[];         // Collaborator addresses
  revenueShares: number[];        // Revenue split percentages
  roles: string[];                // Collaborator roles
  products: number[];             // Shared products
  permissions: Permission[];       // Access permissions
}
```

**Functions to Implement**:
- [ ] `CollaborationManager.tsx`
- [ ] `RevenueSharing.tsx`
- [ ] `PermissionManager.tsx`
- [ ] `CollaboratorInvites.tsx`

### 8. 🔧 Implementation Priority

#### Phase 1: Essential Creator Flow (Weeks 1-2)
- [ ] Creator registration and profile setup
- [ ] Basic product creation form
- [ ] File upload to IPFS
- [ ] Simple pricing configuration
- [ ] Product launch functionality

#### Phase 2: Sales Management (Weeks 3-4)
- [ ] Sales dashboard with basic metrics
- [ ] Order management interface
- [ ] Basic earnings overview
- [ ] Withdrawal functionality

#### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Comprehensive analytics
- [ ] Marketing tools and insights
- [ ] Advanced pricing models
- [ ] Customer communication tools

#### Phase 4: Creator Economy (Weeks 7-8)
- [ ] Creator token system
- [ ] Collaboration tools
- [ ] Advanced revenue streams
- [ ] Community features

---

**This comprehensive creator flow specification ensures that creators have all the tools they need to successfully launch, manage, and monetize their digital products on our onchain platform.**