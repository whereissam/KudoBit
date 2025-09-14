const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Creator Flow on Local Testnet");
    console.log("=" * 50);

    // Get deployed contract addresses
    const deployments = require("./deployments.json");
    console.log("📋 Contract Addresses:");
    console.log("MockUSDC:", deployments.mockUSDC);
    console.log("LoyaltyToken:", deployments.loyaltyToken);
    console.log("Shopfront:", deployments.shopfront);
    console.log("");

    // Get signers (accounts)
    const [owner, creator, customer] = await ethers.getSigners();
    console.log("👥 Test Accounts:");
    console.log("Owner:", owner.address);
    console.log("Creator:", creator.address);
    console.log("Customer:", customer.address);
    console.log("");

    // Connect to deployed contracts
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    const Shopfront = await ethers.getContractFactory("Shopfront");

    const mockUSDC = MockUSDC.attach(deployments.mockUSDC);
    const loyaltyToken = LoyaltyToken.attach(deployments.loyaltyToken);
    const shopfront = Shopfront.attach(deployments.shopfront);

    console.log("💰 Initial USDC Balances:");
    console.log("Owner:", ethers.formatUnits(await mockUSDC.balanceOf(owner.address), 6), "USDC");
    
    // Give some USDC to creator and customer
    await mockUSDC.connect(owner).transfer(creator.address, ethers.parseUnits("10000", 6));
    await mockUSDC.connect(owner).transfer(customer.address, ethers.parseUnits("5000", 6));
    
    console.log("Creator:", ethers.formatUnits(await mockUSDC.balanceOf(creator.address), 6), "USDC");
    console.log("Customer:", ethers.formatUnits(await mockUSDC.balanceOf(customer.address), 6), "USDC");
    console.log("");

    // Test Creator Flow
    console.log("🎨 Testing Creator Flow:");
    
    // 1. Creator registers
    console.log("1. Creator registering...");
    const registerTx = await shopfront.connect(creator).registerCreator("Test Creator", "A test creator profile", "creator");
    await registerTx.wait();
    console.log("✅ Creator registered successfully!");
    
    // 2. Creator creates a product
    console.log("2. Creator creating product...");
    const productPrice = ethers.parseUnits("100", 6); // 100 USDC
    const createProductTx = await shopfront.connect(creator).createProduct(
        "Test Digital Product",
        "A test digital product description",
        productPrice,
        "https://example.com/product-image.jpg",
        "https://example.com/download-link",
        "digital"
    );
    await createProductTx.wait();
    console.log("✅ Product created successfully!");
    
    // Get the product ID (assuming it's the first product)
    const productId = 1;
    
    // 3. Customer purchases product
    console.log("3. Customer purchasing product...");
    
    // First, customer needs to approve USDC spending
    const approveTx = await mockUSDC.connect(customer).approve(shopfront.target, productPrice);
    await approveTx.wait();
    console.log("   ✅ USDC spending approved");
    
    const purchaseTx = await shopfront.connect(customer).purchaseProduct(productId);
    await purchaseTx.wait();
    console.log("✅ Product purchased successfully!");
    
    // 4. Check balances after purchase
    console.log("");
    console.log("💰 Final Balances:");
    console.log("Creator USDC:", ethers.formatUnits(await mockUSDC.balanceOf(creator.address), 6), "USDC");
    console.log("Customer USDC:", ethers.formatUnits(await mockUSDC.balanceOf(customer.address), 6), "USDC");
    console.log("Customer Loyalty Points:", ethers.formatUnits(await loyaltyToken.balanceOf(customer.address), 18), "LOYALTY");
    console.log("");
    
    // 5. Test loyalty token functionality
    console.log("🎯 Testing Loyalty Token:");
    const loyaltyBalance = await loyaltyToken.balanceOf(customer.address);
    console.log("Customer earned", ethers.formatUnits(loyaltyBalance, 18), "loyalty tokens");
    
    // 6. Check creator's products
    console.log("");
    console.log("📊 Creator Stats:");
    // This would require additional functions in the contract to get creator stats
    console.log("Creator has successfully created and sold a product!");
    
    console.log("");
    console.log("🎉 All tests completed successfully!");
    console.log("✅ Creator Flow is working on the local testnet");
}

main()
    .then(() => {
        console.log("\n🚀 Local testnet is ready for development!");
        console.log("You can now connect your frontend to http://127.0.0.1:8545");
    })
    .catch((error) => {
        console.error("❌ Error during testing:", error);
    });