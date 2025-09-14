const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying KudoBit Gumroad Architecture...");

  // Deploy MockUSDC first
  console.log("📦 Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  console.log("✅ MockUSDC deployed to:", await mockUSDC.getAddress());

  // Deploy LoyaltyToken
  console.log("📦 Deploying LoyaltyToken...");
  const LoyaltyToken = await hre.ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  console.log("✅ LoyaltyToken deployed to:", await loyaltyToken.getAddress());

  // Deploy ProductNFT
  console.log("📦 Deploying ProductNFT...");
  const ProductNFT = await hre.ethers.getContractFactory("ProductNFT");
  const productNFT = await ProductNFT.deploy();
  await productNFT.waitForDeployment();
  console.log("✅ ProductNFT deployed to:", await productNFT.getAddress());

  // Deploy CreatorRegistry
  console.log("📦 Deploying CreatorRegistry...");
  const CreatorRegistry = await hre.ethers.getContractFactory("CreatorRegistry");
  const creatorRegistry = await CreatorRegistry.deploy();
  await creatorRegistry.waitForDeployment();
  console.log("✅ CreatorRegistry deployed to:", await creatorRegistry.getAddress());

  // Deploy RoyaltyManager
  console.log("📦 Deploying RoyaltyManager...");
  const [owner] = await hre.ethers.getSigners();
  const RoyaltyManager = await hre.ethers.getContractFactory("RoyaltyManager");
  const royaltyManager = await RoyaltyManager.deploy(owner.address); // Use deployer as platform treasury
  await royaltyManager.waitForDeployment();
  console.log("✅ RoyaltyManager deployed to:", await royaltyManager.getAddress());

  // Deploy ContentAccess
  console.log("📦 Deploying ContentAccess...");
  const ContentAccess = await hre.ethers.getContractFactory("ContentAccess");
  const contentAccess = await ContentAccess.deploy();
  await contentAccess.waitForDeployment();
  console.log("✅ ContentAccess deployed to:", await contentAccess.getAddress());

  // Deploy GumroadCore with all dependencies
  console.log("📦 Deploying GumroadCore...");
  const GumroadCore = await hre.ethers.getContractFactory("GumroadCore");
  const gumroadCore = await GumroadCore.deploy(
    await productNFT.getAddress(),
    await royaltyManager.getAddress(),
    await contentAccess.getAddress()
  );
  await gumroadCore.waitForDeployment();
  console.log("✅ GumroadCore deployed to:", await gumroadCore.getAddress());

  // Setup permissions and initial configuration
  console.log("\n🔐 Setting up permissions...");

  // Grant creator role to owner for testing
  const CREATOR_ROLE = await productNFT.CREATOR_ROLE();
  await productNFT.grantRole(CREATOR_ROLE, owner.address);
  console.log("✅ Granted CREATOR_ROLE to deployer");

  // Grant marketplace role to GumroadCore
  const MARKETPLACE_ROLE = await productNFT.MARKETPLACE_ROLE ? 
    await productNFT.MARKETPLACE_ROLE() : 
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MARKETPLACE_ROLE"));
  
  try {
    await productNFT.grantRole(MARKETPLACE_ROLE, await gumroadCore.getAddress());
    console.log("✅ Granted MARKETPLACE_ROLE to GumroadCore");
  } catch (error) {
    console.log("⚠️  MARKETPLACE_ROLE might not exist in this contract version");
  }

  // Set up loyaltyToken minter
  await loyaltyToken.setAuthorizedMinter(await gumroadCore.getAddress(), true);
  console.log("✅ Authorized GumroadCore as LoyaltyToken minter");

  // Create initial test products
  console.log("\n🎨 Creating test products...");
  
  try {
    // Register owner as creator first
    await creatorRegistry.registerCreator(
      "KudoBit Team",
      "Official KudoBit marketplace team",
      "ipfs://QmTestAvatar"
    );
    console.log("✅ Registered test creator");

    // Create test products using ProductNFT
    const testProducts = [
      {
        name: "Digital Art Collection",
        description: "Exclusive digital artwork collection",
        uri: "ipfs://QmTestArt1",
        price: hre.ethers.parseUnits("50", 6), // 50 USDC
        contentHash: "QmTestContent1"
      },
      {
        name: "Premium Software License",
        description: "Professional software license with source code",
        uri: "ipfs://QmTestSoft1",
        price: hre.ethers.parseUnits("100", 6), // 100 USDC
        contentHash: "QmTestContent2"
      },
      {
        name: "Music Album NFT",
        description: "High-quality music album with exclusive tracks",
        uri: "ipfs://QmTestMusic1",
        price: hre.ethers.parseUnits("25", 6), // 25 USDC
        contentHash: "QmTestContent3"
      }
    ];

    for (let i = 0; i < testProducts.length; i++) {
      const product = testProducts[i];
      const tx = await productNFT.mintProduct(
        product.name,
        product.description,
        product.uri,
        product.price,
        product.contentHash
      );
      await tx.wait();
      console.log(`✅ Created product: ${product.name}`);
      
      // Register product with creator registry
      await creatorRegistry.addProduct(i + 1);
    }

  } catch (error) {
    console.log("⚠️  Error creating test products:", error.message);
  }

  // Prepare deployment summary
  const deployments = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      mockUSDC: await mockUSDC.getAddress(),
      loyaltyToken: await loyaltyToken.getAddress(),
      productNFT: await productNFT.getAddress(),
      creatorRegistry: await creatorRegistry.getAddress(),
      royaltyManager: await royaltyManager.getAddress(),
      contentAccess: await contentAccess.getAddress(),
      gumroadCore: await gumroadCore.getAddress()
    },
    testData: {
      productsCreated: 3,
      creatorsRegistered: 1
    }
  };

  console.log("\n🎉 KudoBit Gumroad Deployment Complete!");
  console.log("=" * 50);
  console.log("Contract addresses:", deployments.contracts);
  
  // Save deployment info
  const fs = require("fs");
  fs.writeFileSync("./gumroad-deployments.json", JSON.stringify(deployments, null, 2));
  console.log("📄 Deployment info saved to gumroad-deployments.json");

  // Test the full flow
  console.log("\n🧪 Testing complete flow...");
  
  try {
    // Give some USDC to another test account
    const [, testBuyer] = await hre.ethers.getSigners();
    await mockUSDC.transfer(testBuyer.address, hre.ethers.parseUnits("1000", 6));
    console.log("✅ Funded test buyer with USDC");

    // Test purchase flow
    const productId = 1;
    const productPrice = hre.ethers.parseUnits("50", 6);
    
    // Approve USDC spending
    await mockUSDC.connect(testBuyer).approve(await gumroadCore.getAddress(), productPrice);
    
    // Purchase product
    await gumroadCore.connect(testBuyer).purchaseProduct(productId, await mockUSDC.getAddress());
    console.log("✅ Test purchase completed successfully!");

    // Check if buyer has access
    const hasAccess = await gumroadCore.hasPurchased(productId, testBuyer.address);
    console.log(`✅ Purchase verification: ${hasAccess ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    console.log("⚠️  Error in test flow:", error.message);
  }

  console.log("\n🚀 Ready for frontend integration!");
  console.log("📱 Update frontend contract addresses with gumroad-deployments.json");

  return deployments;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });