const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying and Testing Contracts");
    console.log("Network:", await ethers.provider.getNetwork());
    
    // Get signers
    const [owner, creator, customer] = await ethers.getSigners();
    console.log("Owner:", owner.address);
    
    // Deploy MockUSDC directly
    console.log("\n📦 Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("MockUSDC deployed to:", mockUSDCAddress);
    
    // Test MockUSDC
    const name = await mockUSDC.name();
    const symbol = await mockUSDC.symbol();
    const balance = await mockUSDC.balanceOf(owner.address);
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Owner balance:", ethers.formatUnits(balance, 6), "USDC");
    
    // Deploy LoyaltyToken
    console.log("\n📦 Deploying LoyaltyToken...");
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    const loyaltyToken = await LoyaltyToken.deploy();
    await loyaltyToken.waitForDeployment();
    const loyaltyTokenAddress = await loyaltyToken.getAddress();
    console.log("LoyaltyToken deployed to:", loyaltyTokenAddress);
    
    // Deploy Shopfront
    console.log("\n📦 Deploying Shopfront...");
    const Shopfront = await ethers.getContractFactory("Shopfront");
    const shopfront = await Shopfront.deploy(mockUSDCAddress, loyaltyTokenAddress);
    await shopfront.waitForDeployment();
    const shopfrontAddress = await shopfront.getAddress();
    console.log("Shopfront deployed to:", shopfrontAddress);
    
    // Authorize Shopfront as minter
    console.log("\n🔐 Authorizing Shopfront as minter...");
    await loyaltyToken.setAuthorizedMinter(shopfrontAddress, true);
    console.log("✅ Shopfront authorized");
    
    // Test Shopping Flow
    console.log("\n🛍️ Testing Shopping Flow:");
    
    // Give some USDC to customer
    await mockUSDC.transfer(customer.address, ethers.parseUnits("5000", 6));
    console.log("💰 Transferred USDC to customer");
    
    // Check available items (should have 3 initial items)
    const allItems = await shopfront.getAllItems();
    console.log("📦 Available items:", allItems.length);
    
    // Customer buys first item (Exclusive Wallpaper NFT - 10 USDC)
    const itemToBuy = 1;
    const item = await shopfront.getItem(itemToBuy);
    const itemPrice = item.priceInUSDC;
    console.log(`🛒 Customer buying "${item.name}" for ${ethers.formatUnits(itemPrice, 6)} USDC`);
    
    await mockUSDC.connect(customer).approve(shopfrontAddress, itemPrice);
    await shopfront.connect(customer).buyItem(itemToBuy);
    console.log("✅ Item purchased successfully!");
    
    // Check final balances
    const ownerBalance = await mockUSDC.balanceOf(owner.address);
    const customerBalance = await mockUSDC.balanceOf(customer.address);
    const customerBronzeBadges = await loyaltyToken.balanceOf(customer.address, 1); // Bronze badge ID
    
    console.log("\n💰 Final Balances:");
    console.log("Owner USDC:", ethers.formatUnits(ownerBalance, 6));
    console.log("Customer USDC:", ethers.formatUnits(customerBalance, 6));
    console.log("Customer Bronze Badges:", ethers.formatUnits(customerBronzeBadges, 0));
    
    // Save deployment info
    const deployments = {
        mockUSDC: mockUSDCAddress,
        loyaltyToken: loyaltyTokenAddress,
        shopfront: shopfrontAddress,
        network: "hardhat",
        chainId: 1337
    };
    
    const fs = require("fs");
    fs.writeFileSync("./deployments.json", JSON.stringify(deployments, null, 2));
    
    console.log("\n🎉 All tests completed successfully!");
    console.log("🚀 Local testnet is ready at http://127.0.0.1:8545");
    console.log("📄 Contract addresses saved to deployments.json");
    
    return deployments;
}

main().catch(console.error);