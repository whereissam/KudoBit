const { ethers } = require("hardhat");

async function main() {
    console.log("Testing contract deployment...");
    
    try {
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        console.log("MockUSDC contract factory found!");
        
        const mockUSDC = await MockUSDC.deploy();
        await mockUSDC.waitForDeployment();
        
        console.log("MockUSDC deployed to:", await mockUSDC.getAddress());
        
        // Test the contract
        const balance = await mockUSDC.balanceOf(await mockUSDC.owner());
        console.log("Owner balance:", ethers.formatUnits(balance, 6), "USDC");
        
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main().catch(console.error);