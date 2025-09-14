const { PinataSDK } = require("pinata");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Pinata with API keys
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY || "gateway.pinata.cloud"
});

async function uploadBadgeAssets() {
  console.log('🚀 Starting IPFS upload process for KudoBit badge assets...\n');

  const badgeAssets = [
    { name: 'bronze-badge', file: 'bronze-badge.svg', tier: 'Bronze' },
    { name: 'silver-badge', file: 'silver-badge.svg', tier: 'Silver' },
    { name: 'gold-badge', file: 'gold-badge.svg', tier: 'Gold' },
    { name: 'diamond-badge', file: 'diamond-badge.svg', tier: 'Diamond' }
  ];

  const uploadResults = [];
  
  try {
    // Upload each badge image to IPFS
    console.log('📤 Uploading badge images to IPFS...');
    for (const badge of badgeAssets) {
      try {
        const imagePath = path.join(__dirname, '..', 'public', 'badges', badge.file);
        const imageFile = fs.readFileSync(imagePath);
        
        // Create a File object for the newer SDK
        const file = new File([imageFile], badge.file, { type: 'image/svg+xml' });
        
        const imageUpload = await pinata.upload.file(file, {
          metadata: {
            name: `KudoBit ${badge.tier} Badge Image`,
            keyValues: {
              project: 'kudobit',
              type: 'badge-image',
              tier: badge.tier.toLowerCase()
            }
          }
        });

        console.log(`✅ ${badge.tier} badge image uploaded: ${imageUpload.IpfsHash}`);
        
        // Create metadata JSON
        const metadata = {
          name: `KudoBit ${badge.tier} Badge`,
          description: `A ${badge.tier.toLowerCase()} tier loyalty badge from KudoBit - The Web3 Gumroad. This NFT represents your support and engagement with creators on the platform.`,
          image: `ipfs://${imageUpload.IpfsHash}`,
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

        // Upload metadata JSON
        const metadataUpload = await pinata.upload.json(metadata, {
          metadata: {
            name: `KudoBit ${badge.tier} Badge Metadata`,
            keyValues: {
              project: 'kudobit',
              type: 'badge-metadata',
              tier: badge.tier.toLowerCase()
            }
          }
        });

        console.log(`✅ ${badge.tier} badge metadata uploaded: ${metadataUpload.IpfsHash}`);

        uploadResults.push({
          tier: badge.tier,
          badgeId: badgeAssets.indexOf(badge) + 1,
          imageHash: imageUpload.IpfsHash,
          metadataHash: metadataUpload.IpfsHash,
          imageUrl: `ipfs://${imageUpload.IpfsHash}`,
          metadataUrl: `ipfs://${metadataUpload.IpfsHash}`,
          gatewayImageUrl: `https://${process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${imageUpload.IpfsHash}`,
          gatewayMetadataUrl: `https://${process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${metadataUpload.IpfsHash}`
        });

      } catch (error) {
        console.error(`❌ Failed to upload ${badge.tier} badge:`, error.message);
      }
    }

    // Generate deployment info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      network: 'morphHolesky',
      chainId: 2810,
      badges: uploadResults,
      baseURI: '', // Will be set after determining URI pattern
      notes: 'KudoBit loyalty badges uploaded to IPFS via Pinata for Morph Holesky deployment'
    };

    // Save results to file
    const outputPath = path.join(__dirname, '..', 'ipfs-deployment.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('\n🎉 IPFS Upload Complete!');
    console.log('📋 Summary:');
    console.log('='.repeat(50));
    
    uploadResults.forEach(result => {
      console.log(`${result.tier} Badge (ID: ${result.badgeId}):`);
      console.log(`  📸 Image: ${result.imageUrl}`);
      console.log(`  📄 Metadata: ${result.metadataUrl}`);
      console.log(`  🌐 Gateway: ${result.gatewayMetadataUrl}`);
      console.log('');
    });

    console.log(`📁 Deployment info saved to: ${outputPath}`);
    console.log('\n🔗 Next Steps:');
    console.log('1. Call LoyaltyToken.setURI() with the base URI or individual URIs');
    console.log('2. Update your frontend to use IPFS URLs for badge display');
    console.log('3. Test badge metadata display in wallets and OpenSea');

    return uploadResults;

  } catch (error) {
    console.error('❌ IPFS upload failed:', error);
    throw error;
  }
}

// Run the upload if this script is called directly
if (require.main === module) {
  uploadBadgeAssets()
    .then(() => {
      console.log('✅ Upload process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Upload process failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadBadgeAssets };