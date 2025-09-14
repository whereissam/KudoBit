
// Script to call LoyaltyToken.setURI() with IPFS base URI
// Run this after uploading to IPFS

const { ethers } = require('hardhat');

async function setLoyaltyTokenURI() {
  const loyaltyTokenAddress = '0x89de622217c01f4c97453a35CaFfF1E7b7D6f8FC';
  const baseURI = 'ipfs://QmKudoBitBadgeBaseURI/';
  
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
