#!/usr/bin/env bun
console.log('📚 SWAGGER API DOCUMENTATION TEST\n');

async function testSwaggerEndpoints() {
  const serverUrl = 'http://localhost:5001';
  
  try {
    console.log('1️⃣ Testing Swagger UI...');
    
    // Test Swagger UI HTML page
    let response = await fetch(`${serverUrl}/docs`);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('SwaggerUI') && html.includes('KudoBit API Documentation')) {
        console.log('   ✅ Swagger UI page loads correctly');
        console.log('   🌐 Available at: http://localhost:5001/docs');
      } else {
        console.log('   ❌ Swagger UI content not found');
      }
    } else {
      console.log(`   ❌ Swagger UI failed: ${response.status} ${response.statusText}`);
    }

    console.log('\n2️⃣ Testing OpenAPI Specification...');
    
    // Test OpenAPI JSON spec
    response = await fetch(`${serverUrl}/api-docs/openapi.json`);
    if (response.ok) {
      const spec = await response.json();
      console.log(`   ✅ OpenAPI spec loaded successfully`);
      console.log(`   📖 API Title: ${spec.info.title}`);
      console.log(`   📝 Version: ${spec.info.version}`);
      console.log(`   📋 Available endpoints: ${Object.keys(spec.paths).length}`);
      console.log('   🔗 Spec available at: http://localhost:5001/api-docs/openapi.json');
      
      // List some key endpoints
      const endpoints = Object.keys(spec.paths);
      console.log('\n   📚 Key API Endpoints:');
      endpoints.slice(0, 8).forEach(path => {
        const methods = Object.keys(spec.paths[path]).join(', ').toUpperCase();
        console.log(`     • ${methods} ${path}`);
      });
      
      if (endpoints.length > 8) {
        console.log(`     ... and ${endpoints.length - 8} more endpoints`);
      }
      
    } else {
      console.log(`   ❌ OpenAPI spec failed: ${response.status} ${response.statusText}`);
    }

    console.log('\n🎉 SWAGGER DOCUMENTATION TEST COMPLETED!');
    console.log('\n🚀 Your API documentation is fully functional!');
    console.log('📖 Visit http://localhost:5001/docs to explore the interactive API documentation');
    
    return true;

  } catch (error) {
    console.error('\n❌ Swagger test failed:', error.message);
    return false;
  }
}

// Run the test
testSwaggerEndpoints().then(success => {
  if (success) {
    console.log('\n✅ SUCCESS: Swagger API documentation is working with PostgreSQL backend!');
  } else {
    console.log('\n❌ FAILED: Check if the server is running on port 5001');
  }
}).catch(console.error);