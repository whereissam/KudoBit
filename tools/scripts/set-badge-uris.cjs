const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function setBadgeURIs() {
  console.log('🚀 Setting IPFS URIs for KudoBit loyalty badges...\n');

  const loyaltyTokenAddress = '0x89de622217c01f4c97453a35CaFfF1E7b7D6f8FC';
  
  // Load IPFS deployment info
  const deploymentPath = path.join(__dirname, '..', 'ipfs-deployment.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ IPFS deployment info not found. Run setup-demo-ipfs.cjs first.');
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const [signer] = await ethers.getSigners();
  
  console.log('Setting URIs with account:', signer.address);
  console.log('LoyaltyToken address:', loyaltyTokenAddress);
  console.log('');

  try {
    const LoyaltyToken = await ethers.getContractAt('LoyaltyToken', loyaltyTokenAddress);

    // Update each badge URI
    for (const badge of deploymentInfo.badges) {
      console.log(`📋 Setting URI for ${badge.tier} Badge (ID: ${badge.badgeId})`);
      console.log(`   URI: ${badge.metadataUrl}`);
      
      const tx = await LoyaltyToken.setTokenURI(badge.badgeId, badge.metadataUrl);
      console.log(`   Transaction: ${tx.hash}`);
      
      await tx.wait();
      console.log(`   ✅ ${badge.tier} Badge URI updated successfully\n`);
    }

    console.log('🎉 All badge URIs updated successfully!');
    console.log('\n📋 Summary:');
    console.log('='.repeat(50));
    
    // Verify the URIs
    for (const badge of deploymentInfo.badges) {
      const uri = await LoyaltyToken.uri(badge.badgeId);
      console.log(`${badge.tier} Badge (ID: ${badge.badgeId}): ${uri}`);
    }

    console.log('\n✅ IPFS integration complete!');
    console.log('🔗 Badge metadata is now hosted on IPFS');
    console.log('🎨 NFT wallets and marketplaces can display badge images');
    console.log('🌐 Decentralized metadata storage achieved');

  } catch (error) {
    console.error('❌ Failed to set badge URIs:', error);
    throw error;
  }
}

// Run the setup if this script is called directly
if (require.main === module) {
  setBadgeURIs()
    .then(() => {
      console.log('✅ Badge URI setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Badge URI setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setBadgeURIs };