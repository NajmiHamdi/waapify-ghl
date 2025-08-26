// Test script to verify working state with real credentials
const express = require('express');
const mysql = require('mysql2/promise');

// Use same credentials as production
const DB_CONFIG = {
  host: 'localhost',
  user: 'waapify_user',  
  password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
  database: 'waapify_ghl'
};

async function testWorkingState() {
  console.log('🧪 === TESTING WORKING STATE ===\n');
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Database connection works!');
    await connection.end();
    
    // Test 2: Start Express App
    console.log('\n2️⃣ Testing Express app startup...');
    const app = express();
    app.use(express.json());
    
    // Test route
    app.get('/test', (req, res) => {
      res.json({ success: true, message: 'App is working!' });
    });
    
    const server = app.listen(3002, () => {
      console.log('✅ Express app started on port 3002');
    });
    
    // Test HTTP request
    setTimeout(async () => {
      try {
        const fetch = await import('node-fetch').then(m => m.default);
        const response = await fetch('http://localhost:3002/test');
        const result = await response.json();
        console.log('✅ HTTP request works:', result);
      } catch (error) {
        console.log('❌ HTTP request failed:', error.message);
      }
      
      server.close();
      console.log('\n🎉 Basic functionality test completed!');
    }, 1000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWorkingState();