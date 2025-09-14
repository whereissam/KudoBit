const { ethers } = require('hardhat');

async function checkContract() {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const address = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
  
  console.log('🔍 Checking contract at:', address);
  
  const code = await provider.getCode(address);
  console.log('📄 Bytecode length:', code.length);
  console.log('📄 Has contract code:', code !== '0x');
  
  if (code === '0x') {
    console.log('❌ No contract deployed at this address!');
  } else {
    console.log('✅ Contract exists at this address');
  }
}

checkContract().catch(console.error);