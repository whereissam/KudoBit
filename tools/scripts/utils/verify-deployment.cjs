#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(exists ? '✅' : '❌', description, exists ? '' : '(MISSING)');
  return exists;
}

function checkContractAddresses() {
  const contractsPath = path.join(__dirname, '../src/lib/contracts.ts');
  if (!fs.existsSync(contractsPath)) {
    console.log('❌ src/lib/contracts.ts not found');
    return false;
  }
  
  const content = fs.readFileSync(contractsPath, 'utf8');
  const hasPlaceholders = content.includes("'0x' as Address");
  
  if (hasPlaceholders) {
    console.log('❌ Contract addresses still contain placeholders');
    console.log('   Run: node scripts/post-deploy.cjs');
    return false;
  } else {
    console.log('✅ Contract addresses updated');
    return true;
  }
}

async function main() {
  console.log('🔍 Monad Commerce - Deployment Verification');
  console.log('===========================================\n');

  let allGood = true;

  console.log('📁 File Structure:');
  allGood &= checkFile('package.json', 'Package.json');
  allGood &= checkFile('hardhat.config.cjs', 'Hardhat config');
  allGood &= checkFile('.env', 'Environment file');
  allGood &= checkFile('dist/index.html', 'Production build');
  
  console.log('\n🔗 Smart Contracts:');
  allGood &= checkFile('contracts/MockUSDC.sol', 'MockUSDC contract');
  allGood &= checkFile('contracts/LoyaltyToken.sol', 'LoyaltyToken contract');
  allGood &= checkFile('contracts/Shopfront.sol', 'Shopfront contract');
  
  console.log('\n🧪 Tests & Scripts:');
  allGood &= checkFile('test/Shopfront.test.cjs', 'Contract tests');
  allGood &= checkFile('scripts/deploy.cjs', 'Deployment script');
  
  console.log('\n📋 Documentation:');
  allGood &= checkFile('README.md', 'Project README');
  allGood &= checkFile('PITCH.md', 'Pitch script');
  allGood &= checkFile('DEPLOYMENT-CHECKLIST.md', 'Deployment checklist');
  
  console.log('\n🚀 Deployment Status:');
  const hasDeployments = checkFile('deployments.json', 'Deployment addresses');
  
  if (hasDeployments) {
    const deployments = JSON.parse(fs.readFileSync('deployments.json', 'utf8'));
    console.log('   📍 Contract Addresses:');
    console.log(`      MockUSDC: ${deployments.mockUSDC}`);
    console.log(`      LoyaltyToken: ${deployments.loyaltyToken}`);
    console.log(`      Shopfront: ${deployments.shopfront}`);
    
    console.log('\n🔄 Frontend Integration:');
    checkContractAddresses();
  } else {
    console.log('❌ Contracts not yet deployed');
    allGood = false;
  }

  console.log('\n📊 Summary:');
  console.log('============');
  
  if (allGood && hasDeployments) {
    console.log('🎉 READY FOR DEMO!');
    console.log('✅ All files present');
    console.log('✅ Contracts deployed');
    console.log('✅ Frontend configured');
    console.log('✅ Production build available');
    
    console.log('\n🚀 Next Steps:');
    console.log('• Test complete user flow: npm run dev');
    console.log('• Deploy to Vercel: upload dist/ folder');
    console.log('• Practice your pitch with live demo');
    console.log('• Prepare backup screenshots');
    
  } else if (hasDeployments) {
    console.log('⚠️  MOSTLY READY');
    console.log('• Fix missing files/configurations above');
    console.log('• Run: npm run build (if dist/ missing)');
    
  } else {
    console.log('🔄 DEPLOYMENT NEEDED');
    console.log('• Get Monad Testnet MON: https://faucet.monad.xyz');
    console.log('• Deploy contracts: npx hardhat run scripts/deploy.cjs --network monadTestnet');
    console.log('• Update frontend: node scripts/post-deploy.cjs');
    console.log('• Build for production: npm run build');
  }

  console.log('\n💡 Pro Tips:');
  console.log('• Test your demo flow at least 3 times');
  console.log('• Have 2-3 funded test wallets ready');
  console.log('• Check mobile responsiveness');
  console.log('• Time your pitch to 3 minutes exactly');
  console.log('• Emphasize Monad\'s speed during transactions');
}

main().catch(console.error);