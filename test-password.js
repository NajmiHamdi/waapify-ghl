require('dotenv').config();

console.log('Raw password from .env:', JSON.stringify(process.env.DB_PASSWORD));
console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log('Password characters:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.split('').map(c => c + '(' + c.charCodeAt(0) + ')').join(' ') : 'none');

// Try with a simpler password temporarily
const mysql = require('mysql2/promise');

async function testWithDifferentPassword() {
  // Test 1: Current password
  console.log('\n=== Test 1: Current password ===');
  try {
    const conn1 = await mysql.createConnection({
      host: 'localhost',
      user: 'waapify_user',
      password: process.env.DB_PASSWORD,
      database: 'waapify_ghl'
    });
    console.log('✅ Current password works');
    await conn1.end();
  } catch (error) {
    console.log('❌ Current password failed:', error.message);
  }
  
  // Test 2: Direct password
  console.log('\n=== Test 2: Direct password ===');
  try {
    const conn2 = await mysql.createConnection({
      host: 'localhost',
      user: 'waapify_user',
      password: '5IYUhdp:+i~}nYpbEPt5OlLM7d4^*6D',
      database: 'waapify_ghl'
    });
    console.log('✅ Direct password works');
    await conn2.end();
  } catch (error) {
    console.log('❌ Direct password failed:', error.message);
  }
}

testWithDifferentPassword();