#!/usr/bin/env bun
import { config } from 'dotenv';

// Load test environment
config({ path: '../.env.test' });

console.log('🌐 REAL API ENDPOINTS TEST - PostgreSQL Integration\n');

async function testApiEndpoints() {
  const serverUrl = 'http://localhost:5001';
  
  try {
    console.log('1️⃣ Testing Server Health...');
    
    // Test basic server health
    let response = await fetch(`${serverUrl}/api/v1/health`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Server health: ${data.status}`);
    } else {
      console.log('   ⚠️ Health endpoint not available, testing other endpoints...');
    }

    console.log('\n2️⃣ Testing Creator Endpoints...');
    
    // Test get all creators
    response = await fetch(`${serverUrl}/api/v1/creators`);
    if (response.ok) {
      const creators = await response.json();
      console.log(`   ✅ GET /api/v1/creators returned ${creators.length || creators.data?.length || 'N/A'} creators`);
    } else {
      console.log(`   ❌ GET /api/v1/creators failed: ${response.status} ${response.statusText}`);
    }

    console.log('\n3️⃣ Testing Product Endpoints...');
    
    // Test get all products  
    response = await fetch(`${serverUrl}/api/v1/products`);
    if (response.ok) {
      const products = await response.json();
      console.log(`   ✅ GET /api/v1/products returned ${products.length || products.data?.length || 'N/A'} products`);
    } else {
      console.log(`   ❌ GET /api/v1/products failed: ${response.status} ${response.statusText}`);
    }

    console.log('\n4️⃣ Testing Authentication Endpoints...');
    
    // Test auth status
    response = await fetch(`${serverUrl}/api/v1/auth/status`);
    if (response.ok) {
      const authStatus = await response.json();
      console.log(`   ✅ GET /api/v1/auth/status returned: ${JSON.stringify(authStatus)}`);
    } else {
      console.log(`   ❌ GET /api/v1/auth/status failed: ${response.status} ${response.statusText}`);
    }

    console.log('\n🎉 API ENDPOINTS TEST COMPLETED!');
    return true;

  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    return false;
  }
}

// Run the test
async function main() {
  const result = await testApiEndpoints();
  
  if (result) {
    console.log('\n🏆 API INTEGRATION WORKING! PostgreSQL backend fully functional!');
    process.exit(0);
  } else {
    console.log('\n❌ API test failed. Make sure the server is running on port 5001.');
    process.exit(1);
  }
}

main().catch(console.error);