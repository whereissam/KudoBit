const { spawn } = require('child_process');
const path = require('path');

async function runTests() {
  console.log('🧪 Running KudoBit Enhanced Contracts Test Suite\n');
  
  const testFiles = [
    'SubscriptionTiers.test.cjs',
    'TippingAndCrowdfunding.test.cjs', 
    'AffiliateProgram.test.cjs',
    'NFTGatedContent.test.cjs',
    'GamefiedEngagement.test.cjs'
  ];
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testFile of testFiles) {
    console.log(`\n📋 Running tests for ${testFile}...`);
    console.log('─'.repeat(50));
    
    try {
      const result = await runSingleTest(testFile);
      totalTests += result.total;
      passedTests += result.passed;
      failedTests += result.failed;
      
      if (result.failed === 0) {
        console.log(`✅ ${testFile}: All tests passed!`);
      } else {
        console.log(`❌ ${testFile}: ${result.failed} tests failed`);
      }
    } catch (error) {
      console.error(`💥 Error running ${testFile}:`, error.message);
      failedTests++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix before deployment.');
    process.exit(1);
  }
}

function runSingleTest(testFile) {
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, testFile);
    const child = spawn('npx', ['hardhat', 'test', testPath], {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });
    
    child.on('close', (code) => {
      // Parse test results from output
      const results = parseTestResults(output);
      
      if (code === 0) {
        resolve(results);
      } else {
        reject(new Error(`Test process exited with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

function parseTestResults(output) {
  // Simple parsing - in a real scenario you'd want more robust parsing
  const passedMatches = output.match(/✓/g) || [];
  const failedMatches = output.match(/\d+\) /g) || [];
  
  return {
    total: passedMatches.length + failedMatches.length,
    passed: passedMatches.length,
    failed: failedMatches.length
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };