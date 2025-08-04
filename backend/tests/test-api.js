import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const API_BASE = 'http://localhost:3001/v1';

// Test utilities
const makeRequest = async (method, url, body = null, headers = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return {
      status: response.status,
      data,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false
    };
  }
};

// Test cases
const tests = [
  {
    name: 'Health Check',
    test: async () => {
      const result = await makeRequest('GET', `${API_BASE.replace('/v1', '')}/`);
      console.log('✓ Health check:', result.status === 200 ? 'PASS' : 'FAIL');
      console.log('  Response:', result.data);
      return result.ok;
    }
  },
  
  {
    name: 'Get Auth Nonce',
    test: async () => {
      const result = await makeRequest('GET', `${API_BASE}/auth/nonce`);
      console.log('✓ Get nonce:', result.status === 200 ? 'PASS' : 'FAIL');
      console.log('  Response:', result.data);
      return result.ok;
    }
  },
  
  {
    name: 'Get All Creators (Should fail without auth)',
    test: async () => {
      const result = await makeRequest('GET', `${API_BASE}/creators`);
      console.log('✓ Creators without auth:', result.status === 401 ? 'PASS' : 'FAIL');
      console.log('  Response:', result.data);
      return result.status === 401;
    }
  },
  
  {
    name: 'Invalid Route',
    test: async () => {
      const result = await makeRequest('GET', `${API_BASE}/invalid`);
      console.log('✓ Invalid route:', result.status === 404 ? 'PASS' : 'FAIL');
      console.log('  Response:', result.data);
      return result.status === 404;
    }
  },
  
  {
    name: 'Create Product (Should fail without auth)',
    test: async () => {
      const result = await makeRequest('POST', `${API_BASE}/products`, {
        productId: 1,
        name: 'Test Product',
        priceUsdc: '10.00'
      });
      console.log('✓ Create product without auth:', result.status === 401 ? 'PASS' : 'FAIL');
      console.log('  Response:', result.data);
      return result.status === 401;
    }
  },
  
  {
    name: 'Invalid Wallet Address',
    test: async () => {
      const result = await makeRequest('GET', `${API_BASE}/creators/invalid-address`);
      console.log('✓ Invalid wallet address:', result.status === 401 ? 'PASS' : 'FAIL'); // Should fail auth first
      console.log('  Response:', result.data);
      return result.status === 401;
    }
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const success = await test.test();
      if (success) passed++;
    } catch (error) {
      console.log('✗ Test failed with error:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} passed`);
  console.log('='.repeat(50));
  
  return passed === total;
}

// Start server and run tests
async function main() {
  console.log('🚀 Starting backend server...');
  
  // Start the server
  const server = spawn('node', ['index-stripe.js'], {
    cwd: '/Users/sam/Desktop/KudoBit/backend',
    stdio: 'pipe'
  });
  
  server.stdout.on('data', (data) => {
    console.log('Server:', data.toString().trim());
  });
  
  server.stderr.on('data', (data) => {
    console.error('Server Error:', data.toString().trim());
  });
  
  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  await setTimeout(3000);
  
  try {
    const success = await runTests();
    process.exit(success ? 0 : 1);
  } finally {
    console.log('\n🛑 Stopping server...');
    server.kill();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}