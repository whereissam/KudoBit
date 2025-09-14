#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'cyan');
  
  try {
    await execAsync('node --version');
    log('✅ Node.js is installed', 'green');
  } catch (error) {
    log('❌ Node.js is not installed. Please install Node.js first.', 'red');
    process.exit(1);
  }
  
  try {
    await execAsync('npm --version');
    log('✅ npm is available', 'green');
  } catch (error) {
    log('❌ npm is not available', 'red');
    process.exit(1);
  }
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found. Please run this from the project root.', 'red');
    process.exit(1);
  }
  
  log('✅ All prerequisites met', 'green');
}

async function installDependencies() {
  log('\n📦 Installing dependencies...', 'cyan');
  
  try {
    const { stdout } = await execAsync('npm install', { cwd: process.cwd() });
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

async function compileContracts() {
  log('\n🔨 Compiling smart contracts...', 'cyan');
  
  try {
    const { stdout } = await execAsync('npx hardhat compile');
    log('✅ Contracts compiled successfully', 'green');
  } catch (error) {
    log('❌ Failed to compile contracts:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

async function checkHardhatConfig() {
  log('\n⚙️  Checking Hardhat configuration...', 'cyan');
  
  if (!fs.existsSync('hardhat.config.cjs')) {
    log('❌ hardhat.config.cjs not found', 'red');
    process.exit(1);
  }
  
  log('✅ Hardhat configuration found', 'green');
}

function startHardhatNode() {
  log('\n🚀 Starting Hardhat local network...', 'cyan');
  log('📝 Note: Keep this terminal open. The network will run until you stop it.', 'yellow');
  log('📝 Press Ctrl+C to stop the network when done testing.', 'yellow');
  
  const child = spawn('npx', ['hardhat', 'node', '--hostname', '0.0.0.0'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('error', (error) => {
    log('❌ Failed to start Hardhat node:', 'red');
    console.error(error.message);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\n⏹️  Shutting down Hardhat node...', 'yellow');
    child.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(0);
  });
}

async function deployContracts() {
  log('\n📋 Deploying enhanced contracts to local network...', 'cyan');
  
  try {
    const { stdout } = await execAsync('npx hardhat run scripts/deploy-enhanced-contracts.cjs --network localhost');
    console.log(stdout);
    log('✅ Contracts deployed successfully', 'green');
    
    // Check if deployments file was created
    if (fs.existsSync('deployments-local.json')) {
      log('✅ Deployment addresses saved to deployments-local.json', 'green');
    }
    
  } catch (error) {
    log('❌ Failed to deploy contracts:', 'red');
    console.error(error.message);
    log('💡 Make sure the Hardhat node is running in another terminal', 'yellow');
    process.exit(1);
  }
}

async function runTests() {
  log('\n🧪 Running comprehensive test suite...', 'cyan');
  
  try {
    const { stdout } = await execAsync('npm run test:enhanced');
    console.log(stdout);
    log('✅ All tests completed', 'green');
  } catch (error) {
    log('⚠️  Some tests may have failed. Check output above.', 'yellow');
    console.error(error.message);
  }
}

function printSummary() {
  log('\n' + '='.repeat(60), 'bright');
  log('🎉 KudoBit Enhanced Contracts Test Environment Ready!', 'green');
  log('='.repeat(60), 'bright');
  
  log('\n📋 What was set up:', 'cyan');
  log('✅ Dependencies installed', 'green');
  log('✅ Smart contracts compiled', 'green');
  log('✅ Local Hardhat network configured', 'green');
  log('✅ Enhanced contracts deployed', 'green');
  log('✅ Comprehensive tests executed', 'green');
  
  log('\n🔧 Available Commands:', 'cyan');
  log('npm run test                 - Run all tests', 'bright');
  log('npm run test:enhanced        - Run enhanced contract tests', 'bright');
  log('npm run deploy:local:node    - Deploy to local network', 'bright');
  log('npm run hardhat:node         - Start local blockchain', 'bright');
  log('npm run compile              - Compile contracts', 'bright');
  
  log('\n📁 Important Files:', 'cyan');
  log('deployments-local.json       - Contract addresses', 'bright');
  log('TESTING-GUIDE.md             - Detailed testing guide', 'bright');
  log('test/*.test.cjs              - Individual test files', 'bright');
  
  log('\n🚀 Next Steps:', 'cyan');
  log('1. Review test results above', 'bright');
  log('2. Check deployments-local.json for contract addresses', 'bright');
  log('3. Integrate addresses into your frontend', 'bright');
  log('4. Run individual tests as needed', 'bright');
  
  log('\n📚 Documentation:', 'yellow');
  log('• Read TESTING-GUIDE.md for detailed instructions');
  log('• Check test files for usage examples');
  log('• Review deployed contract addresses');
  
  log('\n💡 Pro Tips:', 'magenta');
  log('• Keep Hardhat node running for frontend testing');
  log('• Use deployments-local.json addresses in your app');
  log('• Run specific tests during development');
  log('• Check gas usage with REPORT_GAS=true');
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'full';
  
  log('🚀 KudoBit Enhanced Contracts Test Environment Setup', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  try {
    if (mode === 'node-only') {
      log('\n🎯 Starting Hardhat node only...', 'yellow');
      await checkPrerequisites();
      await checkHardhatConfig();
      startHardhatNode(); // This blocks
      return;
    }
    
    if (mode === 'deploy-only') {
      log('\n🎯 Deploying contracts only...', 'yellow');
      await deployContracts();
      return;
    }
    
    if (mode === 'test-only') {
      log('\n🎯 Running tests only...', 'yellow');
      await runTests();
      return;
    }
    
    // Full setup
    await checkPrerequisites();
    await installDependencies();
    await compileContracts();
    await checkHardhatConfig();
    
    log('\n⚠️  Next step requires Hardhat node to be running...', 'yellow');
    log('Please run in another terminal: npm run hardhat:node', 'yellow');
    log('Then press Enter to continue...', 'yellow');
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
    
    await deployContracts();
    await runTests();
    printSummary();
    
  } catch (error) {
    log('\n❌ Setup failed:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };