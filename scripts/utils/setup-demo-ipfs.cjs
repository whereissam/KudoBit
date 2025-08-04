const fs = require('fs');
const path = require('path');

// For demo purposes, we'll create mock IPFS hashes and update the metadata
// This simulates what would happen after real IPFS upload

async function setupDemoIPFS() {
  console.log('🚀 Setting up demo IPFS configuration for KudoBit badges...\n');

  // Mock IPFS hashes (these would be real after Pinata upload)
  const badgeAssets = [
    { 
      name: 'bronze-badge', 
      tier: 'Bronze', 
      badgeId: 1,
      // Mock IPFS hashes - in production these would be from Pinata
      imageHash: 'QmBronzeBadgeImageHash123456789',
      metadataHash: 'QmBronzeBadgeMetadataHash123456789'
    },
    { 
      name: 'silver-badge', 
      tier: 'Silver', 
      badgeId: 2,
      imageHash: 'QmSilverBadgeImageHash123456789',
      metadataHash: 'QmSilverBadgeMetadataHash123456789'
    },
    { 
      name: 'gold-badge', 
      tier: 'Gold', 
      badgeId: 3,
      imageHash: 'QmGoldBadgeImageHash123456789',
      metadataHash: 'QmGoldBadgeMetadataHash123456789'
    },
    { 
      name: 'diamond-badge', 
      tier: 'Diamond', 
      badgeId: 4,
      imageHash: 'QmDiamondBadgeImageHash123456789',
      metadataHash: 'QmDiamondBadgeMetadataHash123456789'
    }
  ];

  const uploadResults = [];

  try {
    // Update metadata files with IPFS URLs
    console.log('📄 Updating metadata files with IPFS URLs...');
    
    for (const badge of badgeAssets) {
      // Read existing metadata
      const metadataPath = path.join(__dirname, '..', 'public', 'metadata', `${badge.name}.json`);
      let metadata = {};
      
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }

      // Update with IPFS URLs
      const updatedMetadata = {
        name: `KudoBit ${badge.tier} Badge`,
        description: `A ${badge.tier.toLowerCase()} tier loyalty badge from KudoBit - The Web3 Gumroad. This NFT represents your support and engagement with creators on the platform.`,
        image: `ipfs://${badge.imageHash}`,
        external_url: "https://kudobit.xyz",
        attributes: [
          {
            trait_type: "Tier",
            value: badge.tier
          },
          {
            trait_type: "Platform",
            value: "KudoBit"
          },
          {
            trait_type: "Type",
            value: "Loyalty Badge"
          },
          {
            trait_type: "Blockchain",
            value: "Morph"
          },
          {
            trait_type: "Standard",
            value: "ERC-1155"
          }
        ],
        properties: {
          category: "Loyalty",
          platform: "KudoBit",
          blockchain: "Morph",
          isTransferable: true,
          utilities: [
            "Creator platform access",
            "Future DAO governance rights",
            "Cross-creator benefits"
          ]
        }
      };

      // Write updated metadata
      fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));
      console.log(`✅ ${badge.tier} metadata updated with IPFS URLs`);

      uploadResults.push({
        tier: badge.tier,
        badgeId: badge.badgeId,
        imageHash: badge.imageHash,
        metadataHash: badge.metadataHash,
        imageUrl: `ipfs://${badge.imageHash}`,
        metadataUrl: `ipfs://${badge.metadataHash}`,
        gatewayImageUrl: `https://gateway.pinata.cloud/ipfs/${badge.imageHash}`,
        gatewayMetadataUrl: `https://gateway.pinata.cloud/ipfs/${badge.metadataHash}`
      });
    }

    // Generate deployment info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      network: 'morphHolesky',
      chainId: 2810,
      loyaltyTokenAddress: '0x89de622217c01f4c97453a35CaFfF1E7b7D6f8FC',
      badges: uploadResults,
      baseURI: 'ipfs://QmKudoBitBadgeBaseURI/', // Base URI for the collection
      notes: 'Demo IPFS setup for KudoBit loyalty badges. In production, these would be real IPFS hashes from Pinata.',
      instructions: {
        realIPFS: 'To use real IPFS, add PINATA_JWT to .env and run upload-to-ipfs.cjs',
        setURI: 'Call LoyaltyToken.setURI() with the base URI to activate IPFS metadata'
      }
    };

    // Save results to file
    const outputPath = path.join(__dirname, '..', 'ipfs-deployment.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('\n🎉 Demo IPFS Setup Complete!');
    console.log('📋 Badge Configuration:');
    console.log('='.repeat(50));
    
    uploadResults.forEach(result => {
      console.log(`${result.tier} Badge (ID: ${result.badgeId}):`);
      console.log(`  📸 Image: ${result.imageUrl}`);
      console.log(`  📄 Metadata: ${result.metadataUrl}`);
      console.log(`  🌐 Gateway: ${result.gatewayMetadataUrl}`);
      console.log('');
    });

    console.log(`📁 Configuration saved to: ${outputPath}`);
    console.log('\n🔗 Next Steps:');
    console.log('1. ✅ Metadata files updated with IPFS URLs');
    console.log('2. 📋 Badge deployment info ready');
    console.log('3. 🔧 Call LoyaltyToken.setURI() to activate IPFS metadata');
    console.log('4. 🌟 For real IPFS: Add PINATA_JWT to .env and run upload-to-ipfs.cjs');

    // Create setURI script
    const setURIScript = `
// Script to call LoyaltyToken.setURI() with IPFS base URI
// Run this after uploading to IPFS

const { ethers } = require('hardhat');

async function setLoyaltyTokenURI() {
  const loyaltyTokenAddress = '${deploymentInfo.loyaltyTokenAddress}';
  const baseURI = '${deploymentInfo.baseURI}';
  
  const [signer] = await ethers.getSigners();
  console.log('Setting URI with account:', signer.address);
  
  const LoyaltyToken = await ethers.getContractAt('LoyaltyToken', loyaltyTokenAddress);
  
  const tx = await LoyaltyToken.setURI(baseURI);
  console.log('Transaction sent:', tx.hash);
  
  await tx.wait();
  console.log('✅ LoyaltyToken URI set to:', baseURI);
}

setLoyaltyTokenURI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

    const setURIPath = path.join(__dirname, 'set-loyalty-uri.cjs');
    fs.writeFileSync(setURIPath, setURIScript);
    console.log(`📜 URI setting script created: ${setURIPath}`);

    return uploadResults;

  } catch (error) {
    console.error('❌ Demo IPFS setup failed:', error);
    throw error;
  }
}

// Run the setup if this script is called directly
if (require.main === module) {
  setupDemoIPFS()
    .then(() => {
      console.log('✅ Demo IPFS setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Demo IPFS setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDemoIPFS };