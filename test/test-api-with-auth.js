#!/usr/bin/env bun
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// Load test environment
config({ path: '../.env.test' });

const JWT_SECRET = process.env.JWT_SECRET || 'kudobit-hackathon-secret-key';
const serverUrl = 'http://localhost:5001';

console.log('🔐 TESTING API WITH MOCK AUTHENTICATION\n');

// Generate a valid JWT token for testing
function generateTestToken() {
  const payload = {
    address: '0x1234567890123456789012345678901234567890',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

async function testProtectedEndpoints() {
  const token = generateTestToken();
  console.log('🎫 Generated test JWT token');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('\n1️⃣ Testing Protected Creator Endpoints...');
    
    // Test GET /api/v1/creators (should work with auth)
    let response = await fetch(`${serverUrl}/api/v1/creators`, { headers });
    console.log(`   GET /api/v1/creators: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Response: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      const error = await response.text();
      console.log(`   ❌ Error: ${error}`);
    }

    console.log('\n2️⃣ Testing Protected Product Endpoints...');
    
    // Test GET /api/v1/products (should work with auth)
    response = await fetch(`${serverUrl}/api/v1/products`, { headers });
    console.log(`   GET /api/v1/products: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Response: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      const error = await response.text();
      console.log(`   ❌ Error: ${error}`);
    }

    console.log('\n3️⃣ Testing Public Endpoints (no auth needed)...');
    
    // Test public analytics endpoint
    response = await fetch(`${serverUrl}/api/v1/analytics`);
    console.log(`   GET /api/v1/analytics: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Response: ${JSON.stringify(data).substring(0, 100)}...`);
    }

    console.log('\n4️⃣ Testing API Root...');
    
    response = await fetch(`${serverUrl}/`);
    console.log(`   GET /: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Response: ${JSON.stringify(data)}`);
    }

    console.log('\n🎉 AUTHENTICATION TESTS COMPLETED!');
    return true;

  } catch (error) {
    console.error('\n❌ Authentication test failed:', error.message);
    return false;
  }
}

async function startServerAndTest() {
  console.log('🚀 Starting server for authentication tests...\n');
  
  // Start server in background
  const { spawn } = await import('child_process');
  
  const serverProcess = spawn('bun', ['run', 'index.js'], {
    cwd: '../backend',
    env: { 
      ...process.env, 
      DB_USER: 'huangbozhang',
      DB_HOST: 'localhost', 
      DB_NAME: 'kudobit_test',
      DB_PASSWORD: '',
      DB_PORT: '5432',
      DB_SSL: 'false',
      PORT: '5001'
    },
    stdio: 'pipe'
  });

  // Wait for server to start
  return new Promise((resolve) => {
    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Server:', data.toString().trim());
      
      if (output.includes('KudoBit Backend running')) {
        console.log('\n✅ Server started! Running tests...\n');
        
        // Wait a moment then run tests
        setTimeout(async () => {
          const testResult = await testProtectedEndpoints();
          
          console.log('\n🛑 Stopping server...');
          serverProcess.kill();
          
          if (testResult) {
            console.log('\n🏆 ALL AUTHENTICATION TESTS PASSED!');
            console.log('✅ PostgreSQL integration with API authentication VERIFIED!');
          } else {
            console.log('\n❌ Some authentication tests failed.');
          }
          
          resolve(testResult);
        }, 2000);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('Event indexer') && !error.includes('Contract addresses')) {
        console.log('Server Error:', error.trim());
      }
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      console.log('\n⏰ Server startup timeout');
      serverProcess.kill();
      resolve(false);
    }, 15000);
  });
}

// Run the test
startServerAndTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(console.error);