# Project: Micro-Commerce & Loyalty on Morph

## 1. Product Requirements Document (PRD) - Detailed

### 1.1. Introduction
"Micro-Commerce & Loyalty on Morph" is a pioneering decentralized application (dApp) designed to revolutionize digital commerce by enabling seamless, low-cost micro-transactions and transparent loyalty programs. It empowers small businesses, independent creators, and community leaders to monetize digital goods and foster customer loyalty directly on the blockchain. By harnessing Morph's cutting-edge **hybrid rollup technology (Optimistic zkEVM with Responsive Validity Proof)** and its **decentralized sequencer network**, our platform delivers a Web2-like user experience with the inherent benefits of Web3: transparency, security, and true ownership, making micro-transactions economically viable and reliable for the first time.

### 1.2. Vision & Goals
* **Vision:** To be the foundational layer for a new wave of consumer-centric, high-volume digital micro-transactions and verifiable loyalty programs, democratizing commerce for creators and small businesses and accelerating mainstream adoption of Web3.
* **Goals (Hackathon Specific - 12 Days):**
    1.  **Core Functionality Demo:** Successfully demonstrate the purchase of a digital item using a test stablecoin on Morph Holesky Testnet.
    2.  **Loyalty Program Showcase:** Visually represent the issuance and display of instant, on-chain loyalty points or badges post-purchase.
    3.  **Highlight Morph's Unique Advantages:** Articulate and visually demonstrate how Morph's hybrid rollup (speed, low cost, responsive security) and decentralized sequencer (fairness, censorship-resistance) are *essential* to the project's feasibility and superior user experience. This is your winning edge.
    4.  **Exceptional UX/UI:** Deliver a highly intuitive, clean, and visually appealing user interface that feels familiar to Web2 users, abstracting blockchain complexities.
    5.  **Robust MVP:** Present a stable, bug-free Minimum Viable Product that clearly communicates the full vision.

### 1.3. Target Audience
* **Primary:**
    * **Independent Digital Creators:** Artists, musicians, writers, educators selling digital content (e.g., exclusive tracks, e-books, wallpapers, premium articles).
    * **Small Online Businesses:** Offering digital subscriptions, unique digital "memberships," or mini-games.
    * **Community Managers:** Issuing on-chain loyalty or reputation tokens for engagement.
* **Secondary:**
    * **Everyday Consumers:** Looking for easy, affordable, and transparent ways to acquire digital content and earn verifiable rewards.
    * **Web3 Developers:** Seeking a practical example of a consumer-focused dApp leveraging Morph's capabilities.

### 1.4. Key Features (MVP for Hackathon)

#### 1.4.1. User (Buyer) Interface (`/` - Homepage, `/loyalty` - Loyalty Dashboard)
* **Seamless Wallet Connection:**
    * **Functionality:** Clear "Connect Wallet" button (e.g., via `@rainbow-me/rainbowkit` for ease of setup or just `wagmi`'s `useConnect`). Displays connected wallet address and balance.
    * **Presentation:** Prominently featured, user-friendly. Handles different states (connecting, connected, disconnected).
* **Digital Product Marketplace:**
    * **Functionality:** Displays 2-3 predefined digital products (e.g., "Exclusive Wallpaper Pack," "Community Access Pass," "Digital Collectible Badge"). Each has a title, image, brief description, and a price in MockUSDC.
    * **Presentation:** Clean, card-based layout for each product. Visually appealing images. Price clearly displayed.
* **"Buy Now" Workflow (Core Transaction):**
    * **Functionality:** A prominent "Buy Now" button for each product.
        1.  User clicks "Buy Now."
        2.  System checks if user has enough MockUSDC and if allowance is set.
        3.  If no allowance, prompts user to approve MockUSDC spending for the `Shopfront` contract.
        4.  Executes `Shopfront.buyItem()` transaction.
        5.  Upon successful transaction, displays instant confirmation message.
        6.  *Conceptually:* Triggers the loyalty award (demonstrated manually in MVP).
    * **Presentation:**
        * Clear modal/toast messages for "Approving...", "Processing Payment...", "Payment Successful!".
        * Visually emphasize the *speed* of Morph's transaction confirmation. A quick success toast is key.
        * Subtle animations on button clicks or transaction completion.
* **"My Loyalty" Dashboard:**
    * **Functionality:** Displays the user's current balance of loyalty points (ERC-20) or a gallery of collected loyalty badges (ERC-1155 NFTs, showing their images).
    * **Presentation:** Dedicated page (`/loyalty`). Clear display of points/badges. Visually satisfying (e.g., vibrant badges).

#### 1.4.2. Merchant (Admin) Interface (`/admin` - Simplified for Demo)
* **Simulated Product Management (Hardcoded):**
    * **Functionality:** For the hackathon, product listings are fixed within the `Shopfront.sol` contract or hardcoded in the frontend. No dynamic "Add Product" UI needed.
    * **Presentation:** N/A for this MVP.
* **Manual Loyalty Award (Demo Tool):**
    * **Functionality:** A simple interface for the demo presenter (acting as the merchant). Input field for `recipientAddress`, input field for `pointsAmount` (or `badgeId`). A button to "Award Loyalty." This calls `LoyaltyToken.awardPoints()` or `LoyaltyToken.mintBadge()`.
    * **Presentation:** A bare-bones, clearly labeled "Admin Panel" page accessible via a direct URL, not linked from the main UI. It's strictly for demonstrating the loyalty issuance part during the pitch.

#### 1.4.3. Smart Contracts (Deployed on Morph Holesky Testnet)
* **`MockUSDC.sol` (ERC-20 Standard):**
    * Standard `ERC20.sol` (OpenZeppelin).
    * `faucet()` function (optional) or pre-fund test accounts.
* **`LoyaltyToken.sol` (Choose one for simplicity):**
    * **Option A: ERC-20 (Loyalty Points):**
        * Standard `ERC20.sol` (OpenZeppelin).
        * `mint(address recipient, uint256 amount)`: Callable by `Shopfront.sol` or merchant address.
    * **Option B: ERC-1155 (Loyalty Badges/NFTs):**
        * Standard `ERC1155.sol` (OpenZeppelin) with `ERC1155URIStorage`.
        * `mint(address recipient, uint256 id, uint256 amount, bytes data)`: Callable by `Shopfront.sol` or merchant address. `amount` would typically be `1` for unique badges.
* **`Shopfront.sol`:**
    * Imports `IERC20` (for MockUSDC) and `ILoyaltyToken` (interface of your chosen loyalty token).
    * Constructor takes `_mockUsdcAddress` and `_loyaltyTokenAddress`.
    * `setProduct(uint256 itemId, uint256 price, string memory name, string memory imageUrl)`: Sets item details (owner-only). Define 2-3 items.
    * `buyItem(uint256 itemId)`:
        * `require(IERC20(mockUsdc).transferFrom(msg.sender, address(this), price));` (pulls from buyer after approval).
        * `IERC20(mockUsdc).transfer(owner, price);` (sends to merchant).
        * *Conceptual call (for later automation):* `ILoyaltyToken(loyaltyToken).awardPoints(msg.sender, pointsPerPurchase);` (for demo, this would be a manual call from the admin page).
    * `withdrawFunds()`: Merchant can withdraw earned MockUSDC (owner-only).

### 1.5. Technical Requirements

* **Blockchain:** Morph Holesky Testnet.
    * RPC URL: `https://rpc-holesky.morphl2.io` (or `https://2810.rpc.thirdweb.com`)
    * Chain ID: `2810`
    * Explorer: `https://explorer-holesky.morphl2.io`
* **Smart Contracts:** Solidity (using `solc` compiler via Hardhat/Foundry).
* **Development Frameworks:** Hardhat (recommended for easier testing, deployment scripts).
* **Frontend:** Next.js (React), Wagmi (for React hooks), Viem (underlying low-level client), Tailwind CSS (for rapid styling).
* **Wallet Integration:** MetaMask (standard choice, widely used).
* **Test Tokens:** Morph Holesky ETH (for gas on Morph) and your deployed `MockUSDC` on Morph Holesky.
* **Hosting:** Vercel (seamless deployment for Next.js).

### 1.6. Success Metrics (for Hackathon Judging)
* **Functional Demo:** The live application demonstrates the entire user flow (connect wallet, view products, buy item, view loyalty) flawlessly.
* **Problem/Solution Fit:** Clear articulation of the problem (high fees, complexity of micro-transactions) and how the dApp uniquely solves it.
* **Morph Advantage Articulation:** The presentation explicitly connects the dApp's capabilities directly to Morph's specific technical advantages (Hybrid Rollup for speed/cost/security, Decentralized Sequencer for fairness/reliability).
* **User Experience (UX):** The UI is intuitive, clean, and requires minimal blockchain knowledge from the end-user. The transaction process feels fast and efficient.
* **Code Quality:** Smart contracts are secure, concise, and well-commented. Frontend code is organized and readable.
* **Innovation & Future Potential:** The project showcases a novel use case for blockchain in everyday consumer interactions and has a clear roadmap for future development.

---

## 2. 12-Day Hackathon Plan with Checklists - Detailed User Flow & Presentation

This plan is aggressive but achievable if you stay focused and prioritize.

### **User Flow: Buying a Digital Item & Earning Loyalty**

1.  **Landing Page (`/`):** User arrives at `microcommerce.morph`.
2.  **Connect Wallet:** User clicks "Connect Wallet" button, connects MetaMask to Morph Holesky.
3.  **Browse Products:** User sees a curated list of digital products (e.g., "Exclusive Wallpaper," "Premium Content").
4.  **Select Product:** User clicks on a product card.
5.  **Initiate Purchase:** User clicks "Buy Now" on the product detail.
6.  **Approve USDC (if first time):** MetaMask pops up, user approves `Shopfront` contract to spend MockUSDC. This is a separate transaction.
7.  **Confirm Purchase:** MetaMask pops up again, user confirms the `buyItem` transaction.
8.  **Instant Confirmation:** Frontend displays a *very fast* "Payment Successful!" toast/modal, thanks to Morph's optimistic finality.
9.  **View Loyalty (Manual Demo Step):** Presenter navigates to "My Loyalty" page (`/loyalty`) to show that loyalty points/badges have *conceptually* been awarded.
10. **Merchant Action (Behind the Scenes/Admin Page Demo):** Presenter briefly navigates to the `/admin` page, inputs the buyer's address, and clicks "Award Loyalty" to manually mint the points/badge to demonstrate the on-chain loyalty issuance.

### **Phase 1: Foundation & Contracts (Days 1-4)**

* **Day 1: Project Setup & Research (Today)**
    * **Goal:** Dev environment ready, test tokens acquired, basic project structure.
    * **Checklist:**
        * [ ] Create GitHub repository: `morph-microcommerce-loyalty`.
        * [ ] Initialize Next.js/React project: `npx create-next-app@latest morph-microcommerce --ts --tailwind --eslint`.
        * [ ] Install Hardhat: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`.
        * [ ] Install Wagmi/Viem: `npm install wagmi viem @tanstack/react-query`.
        * [ ] Configure Wagmi for Morph Holesky Testnet in `src/wagmi.ts` (create this file):
            ```typescript
            // src/wagmi.ts
            import { http, createConfig } from 'wagmi';
            import { mainnet } from 'wagmi/chains'; // You'll configure Morph Holesky below
            import { injected, metaMask, walletConnect } from 'wagmi/connectors';

            // Define Morph Holesky chain details
            const morphHolesky = {
              id: 2810, // Morph Holesky Chain ID
              name: 'Morph Holesky',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: {
                default: { http: ['[https://rpc-holesky.morphl2.io](https://rpc-holesky.morphl2.io)'] },
              },
              blockExplorers: {
                default: { name: 'Morphscan', url: '[https://explorer-holesky.morphl2.io](https://explorer-holesky.morphl2.io)' },
              },
              testnet: true,
            };

            export const config = createConfig({
              chains: [morphHolesky, mainnet], // Add mainnet for connector flexibility if needed, but focus on Morph Holesky
              connectors: [
                injected(),
                metaMask(),
                walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' }), // Get a free project ID from WalletConnect Cloud
              ],
              ssr: true,
              transports: {
                [morphHolesky.id]: http(),
                [mainnet.id]: http(),
              },
            });
            ```
        * [ ] Wrap your `App` in `src/app/layout.tsx` with `WagmiProvider` and `QueryClientProvider`:
            ```typescript jsx
            // src/app/layout.tsx
            'use client';
            import './globals.css';
            import { Inter } from 'next/font/google';
            import { WagmiProvider } from 'wagmi';
            import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
            import { config } from '../wagmi'; // Adjust path if needed

            const inter = Inter({ subsets: ['latin'] });
            const queryClient = new QueryClient();

            export default function RootLayout({
              children,
            }: {
              children: React.ReactNode;
            }) {
              return (
                <html lang="en">
                  <body className={inter.className}>
                    <WagmiProvider config={config}>
                      <QueryClientProvider client={queryClient}>
                        {children}
                      </QueryClientProvider>
                    </WagmiProvider>
                  </body>
                </html>
              );
            }
            ```
        * [ ] Get Morph Holesky ETH from faucet: `faucet.morphl2.io`.
        * [ ] Deploy a simple ERC-20 `MockUSDC.sol` (or use a well-known testnet ERC-20 on Holesky if available). **Crucial for demo:** Fund your merchant wallet and a few test user wallets with MockUSDC.
            * *Example `MockUSDC.sol` (in `contracts/MockUSDC.sol`):*
                ```solidity
                // SPDX-License-Identifier: MIT
                pragma solidity ^0.8.20;

                import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
                import "@openzeppelin/contracts/access/Ownable.sol";

                contract MockUSDC is ERC20, Ownable {
                    constructor() ERC20("Mock USD Coin", "MockUSDC") Ownable(msg.sender) {
                        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1,000,000 to deployer
                    }

                    function faucet(address recipient, uint256 amount) public onlyOwner {
                        _mint(recipient, amount);
                    }
                }
                ```
        * [ ] Basic `README.md` file initialized with project name and quick setup steps.

* **Day 2: Smart Contract Drafting - `Shopfront.sol` & `LoyaltyToken.sol`**
    * **Goal:** Initial contract structures outlined and basic functions drafted.
    * **Checklist:**
        * [ ] Create `contracts/Shopfront.sol` and `contracts/LoyaltyToken.sol`.
        * [ ] `Shopfront.sol` structure:
            ```solidity
            // SPDX-License-Identifier: MIT
            pragma solidity ^0.8.20;

            import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
            import "@openzeppelin/contracts/access/Ownable.sol";

            interface ILoyaltyToken {
                function mintBadge(address recipient, uint256 badgeId) external; // If using ERC-1155
                // function awardPoints(address recipient, uint256 amount) external; // If using ERC-20
            }

            contract Shopfront is Ownable {
                struct DigitalProduct {
                    uint256 id;
                    uint256 priceInUSDC; // Price in MockUSDC (e.g., 1e6 for $1.00)
                    string name;
                    string imageUrl;
                    bool isActive;
                }

                mapping(uint256 => DigitalProduct) public products;
                uint256[] public productIds; // To easily iterate products

                IERC20 public immutable mockUsdc;
                ILoyaltyToken public immutable loyaltyToken; // Or ERC20 for points

                event ProductPurchased(uint256 indexed itemId, address indexed buyer, uint256 price);
                event LoyaltyAwarded(address indexed recipient, uint256 indexed loyaltyAmountOrBadgeId);

                constructor(address _mockUsdcAddress, address _loyaltyTokenAddress) Ownable(msg.sender) {
                    mockUsdc = IERC20(_mockUsdcAddress);
                    loyaltyToken = ILoyaltyToken(_loyaltyTokenAddress);
                }

                // Owner only: Set/update a product
                function setProduct(uint256 id, uint256 price, string calldata name, string calldata imageUrl, bool isActiveStatus) public onlyOwner {
                    if (!products[id].isActive) {
                        productIds.push(id); // Only add to array if new product
                    }
                    products[id] = DigitalProduct(id, price, name, imageUrl, isActiveStatus);
                }

                // Buy a product
                function buyItem(uint256 itemId) public {
                    DigitalProduct storage product = products[itemId];
                    require(product.isActive, "Product is not active");
                    require(mockUsdc.transferFrom(msg.sender, address(this), product.priceInUSDC), "USDC transfer failed"); // Pulls from buyer
                    require(mockUsdc.transfer(owner(), product.priceInUSDC), "Transfer to merchant failed"); // Sends to merchant

                    // --- For MVP demo, this loyalty part might be manual via admin page ---
                    // However, in a full version, it would be called here
                    // loyaltyToken.mintBadge(msg.sender, itemId); // Or awardPoints
                    // emit LoyaltyAwarded(msg.sender, itemId);
                    // ------------------------------------------------------------------

                    emit ProductPurchased(itemId, msg.sender, product.priceInUSDC);
                }

                // Helper to get all product IDs
                function getAllProductIds() public view returns (uint256[] memory) {
                    return productIds;
                }

                // Owner only: Withdraw earned funds
                function withdrawFunds() public onlyOwner {
                    uint256 balance = mockUsdc.balanceOf(address(this));
                    require(balance > 0, "No funds to withdraw");
                    mockUsdc.transfer(owner(), balance);
                }
            }
            ```
        * `LoyaltyToken.sol` (Example with ERC-1155 badges for visual appeal):
            ```solidity
            // SPDX-License-Identifier: MIT
            pragma solidity ^0.8.20;

            import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
            import "@openzeppelin/contracts/access/Ownable.sol";
            import "@openzeppelin/contracts/utils/Context.sol";

            contract LoyaltyBadge is ERC1155, Ownable {
                // Base URI where metadata for badges will be stored
                string public name;
                string public symbol;

                // Emitted when a new badge URI is set
                event BadgeURISet(uint256 indexed badgeId, string newUri);

                constructor(string memory _name, string memory _symbol, string memory uri_) ERC1155(uri_) Ownable(msg.sender) {
                    name = _name;
                    symbol = _symbol;
                }

                // Function to set the URI for a specific badge ID
                function setURI(uint256 _id, string memory _newUri) public onlyOwner {
                    _setURI(_newUri); // ERC1155's _setURI sets the base URI for all.
                    // For per-token URI, you would need to manage this externally or via a more complex metadata solution.
                    // For hackathon, setting a base URI and using token IDs for differentiation is fine.
                    emit BadgeURISet(_id, _newUri);
                }

                // Function to mint a specific badge (only callable by owner/Shopfront)
                function mintBadge(address account, uint256 id) public onlyOwner {
                    require(account != address(0), "ERC1155: mint to the zero address");
                    _mint(account, id, 1, ""); // Mint 1 unit of this badge ID
                }

                // Optional: Batch mint (not strictly needed for MVP)
                function mintBatchBadges(address to, uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
                    _mintBatch(to, ids, amounts, "");
                }
            }
            ```

* **Day 3: Contract Implementation & Local Testing**
    * **Goal:** Core contract logic implemented and unit-tested locally.
    * **Checklist:**
        * [ ] Implement all logic within `Shopfront.sol` (product setting, buying).
        * [ ] Implement all logic within `LoyaltyToken.sol` (minting badges/points).
        * [ ] Create Hardhat/Foundry test files (`test/Shopfront.js`, `test/LoyaltyToken.js`).
        * [ ] Write and run tests for:
            * `MockUSDC` deployment and basic transfer/faucet (if custom).
            * `LoyaltyToken` deployment, `mintBadge` (or `awardPoints`), `balanceOf` tests.
            * `Shopfront` deployment, `setProduct`, `buyItem` (including `approve` calls), and ensuring `MockUSDC` is transferred correctly.
        * [ ] Ensure tests cover `require` statements (e.g., buying inactive product).

* **Day 4: Deployment to Morph Holesky**
    * **Goal:** All smart contracts live and verified on Morph Holesky.
    * **Checklist:**
        * [ ] Configure `hardhat.config.js` with Morph Holesky network details (RPC, accounts, etherscan API key for verification if needed).
        * [ ] Write deployment scripts (e.g., `scripts/deploy.js`) for:
            * `MockUSDC` (if custom)
            * `LoyaltyToken`
            * `Shopfront` (passing deployed `MockUSDC` and `LoyaltyToken` addresses to its constructor).
        * [ ] Run deployment scripts: `npx hardhat run scripts/deploy.js --network morphHolesky`.
        * [ ] **Crucial:** Record all deployed contract addresses (MockUSDC, LoyaltyToken, Shopfront).
        * [ ] Verify contracts on the Morph Holesky Explorer (`explorer-holesky.morphl2.io`). This makes your code transparent to judges.
        * [ ] Update your frontend's `wagmi.ts` or a separate `config.ts` file with these new addresses and ABIs.

### **Phase 2: Frontend & Core Logic (Days 5-8)**

* **Day 5: Wallet Integration & Basic Shop UI**
    * **Goal:** Wallet connects, basic shop page renders, displays hardcoded product data (from contract).
    * **Checklist:**
        * [ ] Create `src/app/page.tsx` for the shop.
        * [ ] Implement a `ConnectButton` component (can be a simple Wagmi `useConnect` button or a `RainbowKit` component if you opted for it).
        * [ ] Display connected wallet address and Morph ETH balance using `wagmi` hooks.
        * [ ] Create a `products.json` or `products.ts` mock data file for product details (ID, name, price, image URL, description).
        * [ ] Fetch actual product details from your `Shopfront` contract using `useContractRead` (e.g., `products` mapping, `getAllProductIds()`).
        * [ ] Map contract data to product cards with Tailwind CSS.

* **Day 6: "Buy Now" Integration**
    * **Goal:** Users can initiate and see feedback for purchases.
    * **Checklist:**
        * [ ] For each product card, add a "Buy Now" button.
        * [ ] Use `wagmi`'s `useApprove` hook for `MockUSDC` to handle token approval for the `Shopfront` contract.
        * [ ] Use `wagmi`'s `useWriteContract` hook for `Shopfront.buyItem()`.
        * [ ] Implement sequential transaction flow: first `approve`, then `buyItem`.
        * [ ] Use `react-hot-toast` or similar for clear, quick notifications: "Waiting for approval...", "Approval successful!", "Processing payment...", "Payment successful!", "Error: [message]".
        * [ ] **Visual Emphasis:** Add a subtle animation (e.g., a checkmark quickly appearing) to the "Payment Successful" toast/modal to convey Morph's speed.

* **Day 7: "My Loyalty" Page & Data Fetching**
    * **Goal:** Loyalty data displays correctly for the connected user.
    * **Checklist:**
        * [ ] Create `src/app/loyalty/page.tsx`.
        * [ ] Add a navigation link to this page (e.g., in the header).
        * [ ] Use `wagmi`'s `useContractRead` to fetch the user's loyalty balance (`LoyaltyToken.balanceOf(address)`) if using ERC-20 points.
        * [ ] If using ERC-1155 badges:
            * Fetch all possible badge IDs (can be hardcoded or read from contract).
            * For each badge ID, check if the user `balanceOf(userAddress, badgeId)` is `> 0`.
            * Display owned badges as a gallery of images (e.g., from IPFS or a simple CDN for hackathon).
        * [ ] Present loyalty data cleanly with appropriate labels (e.g., "Your Points:", "Your Badges:").

* **Day 8: Simplified Merchant Admin (for Demo)**
    * **Goal:** Ability to demonstrate loyalty award from a "merchant" perspective.
    * **Checklist:**
        * [ ] Create a simple `src/app/admin/page.tsx`. Ensure this route is *not* easily discoverable/linked in the main UI.
        * [ ] Add input fields for `recipientAddress` and `pointsAmount`/`badgeId`.
        * [ ] Add a button "Award Loyalty".
        * [ ] Use `wagmi`'s `useWriteContract` to call `LoyaltyToken.mintBadge()` (or `awardPoints()`) from the merchant wallet (ensure the merchant wallet is connected to this admin page).
        * [ ] Add success/error toasts for the admin actions.

### **Phase 3: Polish, Pitch & Deployment (Days 9-12)**

* **Day 9: UI/UX Refinements**
    * **Goal:** Clean, modern, and user-friendly design.
    * **Checklist:**
        * [ ] Refine Tailwind CSS classes for consistent theme (e.g., Morph-inspired green/purple accents).
        * [ ] Improve layout, spacing, and typography.
        * [ ] Add subtle interactive elements (e.g., product card hover effects, button animations).
        * [ ] Ensure excellent mobile responsiveness across all pages.
        * [ ] Use clear, concise copy that avoids jargon where possible.

* **Day 10: Performance & Error Handling**
    * **Goal:** Robust and performant application ready for demo.
    * **Checklist:**
        * [ ] Review all `wagmi` hooks to ensure data is fetched efficiently and updates reactively.
        * [ ] Implement a global error boundary (e.g., a simple `try-catch` around transaction calls or using React error boundaries).
        * [ ] Test edge cases:
            * User rejects MetaMask transaction.
            * User has insufficient MockUSDC.
            * Network changes (e.g., user switches from Morph Holesky to Sepolia during flow).
            * Incorrect wallet connected (e.g., trying to use admin features with a regular user wallet).
        * [ ] Verify all loading states provide clear user feedback.

* **Day 11: Demo Script & Presentation Prep**
    * **Goal:** Be fully prepared to deliver a winning pitch.
    * **Checklist:**
        * [ ] **Craft your 3-minute pitch script.** Structure:
            * **Hook (15s):** "Imagine buying digital content and earning instant, verifiable loyalty points with zero hidden fees. This is Micro-Commerce on Morph."
            * **Problem (30s):** "Traditional platforms have high fees, lack transparency. Existing Web3 is too complex/expensive for micro-transactions."
            * **Solution (45s):** "Our dApp enables seamless digital purchases and on-chain loyalty, making micro-transactions viable for the first time."
            * **✨ Morph Advantage (1 min - THIS IS KEY):**
                * "We chose Morph because its **Hybrid Rollup (Optimistic zkEVM with RVP)** allows for *lightning-fast, incredibly low-cost, yet securely final* micro-transactions – something impossible on L1 and uniquely balanced among L2s. This is why buying a $0.50 digital sticker makes economic sense here."
                * "And Morph's **Decentralized Sequencer** ensures every purchase, every loyalty point, is processed *fairly and without censorship*, guaranteeing trust for both buyer and seller."
                * "This combination truly delivers on Morph's vision of being the **Global Consumer Layer**."
            * **Demo Walkthrough (1 min):**
                * Connect Wallet.
                * Show products.
                * Perform a purchase (emphasize speed of confirmation).
                * Navigate to "My Loyalty" (show the conceptual loyalty award).
                * Briefly show the `/admin` page demonstrating how loyalty can be issued on-chain.
            * **Future Vision (15s):** Brief mention of automated loyalty, fiat on-ramps, creator dashboards.
        * [ ] **Practice the demo flow repeatedly** to ensure it's seamless and highlights Morph's advantages naturally.
        * [ ] Prepare concise slides (if applicable) reinforcing key points, especially Morph's benefits.
        * [ ] Finalize your GitHub `README.md` with detailed explanations, setup, screenshots, and live demo link.

* **Day 12: Final Testing & Submission**
    * **Goal:** Project deployed and submitted on time.
    * **Checklist:**
        * [ ] Conduct final end-to-end tests on a fresh browser/incognito window to ensure no caching issues.
        * [ ] Deploy your Next.js/React frontend to Vercel: `npm run build && npx vercel --prod`.
        * [ ] Update `README.md` and any submission forms with the live demo URL.
        * [ ] Create a clear, concise demo video (if required by the hackathon).
        * [ ] **Submit your project!**
        * [ ] Celebrate your hard work!

---

### Potential Features to Add (Post-Hackathon or if you magically finish early):

If you find yourself ahead of schedule, these would enhance the project:

1.  **Automated Loyalty Award:** Integrate the `LoyaltyToken.mintBadge()` or `awardPoints()` call directly within the `Shopfront.buyItem()` function (as commented out in the example `Shopfront.sol`). This makes loyalty truly automatic.
2.  **Product Metadata on IPFS:** Instead of hardcoding product images/names, store metadata JSON (including image URL) on IPFS and just store the IPFS CID in the `Shopfront` contract.
3.  **Basic Creator Dashboard:** A simple page where a creator can see their sales history and list new products (requires more complex smart contract logic for product creation).
4.  **Fiat On-Ramp Integration (Mocked):** Simulate a fiat on-ramp using a placeholder button or message to show how users could easily get MockUSDC.
5.  **Multi-Item Purchase:** Allow users to add multiple items to a "cart" and purchase them in a single transaction.
6.  **Subscription Model:** Implement a recurring payment smart contract (e.g., using a modified ERC-20 `permit` or a simple escrow) for digital subscriptions.
7.  **Gamified Loyalty Tiers:** Based on total loyalty points/badges, display different tiers with unique perks.

This detailed plan should provide a clear roadmap to a winning project. Focus on execution and showcasing Morph's strengths!