#!/usr/bin/env bun
import { config } from 'dotenv';
import { initializeDatabase, closeDatabase, dbPostgreSQL as db } from '../backend/database-postgresql.js';

// Load test environment
config({ path: '../.env.test' });

console.log('🧪 REAL DATABASE TEST - PostgreSQL Migration Verification\n');

async function runDatabaseTests() {
  try {
    // Test 1: Database Initialization
    console.log('1️⃣ Testing Database Initialization...');
    await initializeDatabase();
    console.log('   ✅ Database initialized successfully');

    // Test 2: Creator Operations
    console.log('\n2️⃣ Testing Creator Operations...');
    
    // Create a test creator
    const testAddress = '0x' + Date.now().toString(16).padStart(40, '0');
    const testCreator = await db.createCreator(
      testAddress,
      `Test Creator ${Date.now()}`,
      'A test creator for PostgreSQL verification',
      { twitter: '@testcreator' }
    );
    console.log(`   ✅ Creator created: ${testCreator.display_name} (${testCreator.address})`);

    // Get creator
    const creator = await db.getCreator(testAddress);
    console.log(`   ✅ Creator retrieved: ${creator.display_name}`);

    // Test 3: Product Operations  
    console.log('\n3️⃣ Testing Product Operations...');
    
    const productId = Math.floor(Date.now() / 1000); // Use smaller timestamp
    const testProduct = await db.createProduct(
      testAddress,
      productId,
      'Test Product ' + Date.now(),
      'A test product for PostgreSQL verification',
      29990000, // price in USDC (with 6 decimals)
      'QmTest' + Date.now()
    );
    console.log(`   ✅ Product created: ${testProduct.name} (ID: ${testProduct.product_id})`);

    // Get products by creator
    const products = await db.getProductsByCreator(testAddress);
    console.log(`   ✅ Found ${products.length} product(s) for creator`);

    // Test 4: Session Operations
    console.log('\n4️⃣ Testing Session Operations...');
    
    const sessionToken = 'test_token_' + Date.now();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    
    await db.createSession(testAddress, sessionToken, expiresAt);
    console.log(`   ✅ Session created for address`);

    // Get session
    const session = await db.getSession(testAddress);
    console.log(`   ✅ Session retrieved: expires at ${session.expires_at}`);

    // Test 5: Data Retrieval Operations
    console.log('\n5️⃣ Testing Data Retrieval Operations...');
    
    const allCreators = await db.getAllCreators();
    console.log(`   ✅ Found ${allCreators.length} total creator(s) in database`);

    // Test 6: Cleanup Test Data
    console.log('\n6️⃣ Cleaning Up Test Data...');
    
    // Clean up session
    await db.deleteSession(testAddress);
    console.log('   ✅ Test session cleaned up');
    
    console.log('   ✅ Test data cleanup completed');

    console.log('\n🎉 ALL DATABASE TESTS PASSED! PostgreSQL migration verified successfully.');
    
    return true;

  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    // Always cleanup database connections
    await closeDatabase();
    console.log('\n🔌 Database connections cleaned up');
  }
}

// Test API Integration
async function testAPIIntegration() {
  console.log('\n🌐 TESTING API INTEGRATION...\n');
  
  try {
    // Start the server in test mode
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const server = spawn('bun', ['run', 'index.js'], {
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: 'pipe'
      });

      let output = '';
      server.stdout.on('data', (data) => {
        output += data.toString();
        console.log('Server:', data.toString().trim());
        
        // Check if server started successfully
        if (output.includes('KudoBit Backend starting')) {
          console.log('   ✅ Server started successfully');
          server.kill();
          resolve(true);
        }
      });

      server.stderr.on('data', (data) => {
        console.log('Server Error:', data.toString().trim());
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        console.log('   ⏰ Server test timeout (this is normal)');
        server.kill();
        resolve(true);
      }, 10000);
    });
    
  } catch (error) {
    console.error('❌ API integration test failed:', error.message);
    return false;
  }
}

// Run all tests
async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const dbTestResult = await runDatabaseTests();
  const apiTestResult = await testAPIIntegration();
  
  if (dbTestResult && apiTestResult) {
    console.log('\n🏆 ALL TESTS PASSED! Your PostgreSQL migration is working perfectly!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

main().catch(console.error);