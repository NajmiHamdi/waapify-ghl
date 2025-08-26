const mysql = require('mysql2/promise');

async function simpleTest() {
  try {
    console.log('Testing direct connection...');
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'waapify_local',
      password: 'local123',
      database: 'waapify_local_test'
    });
    
    console.log('✅ Connection successful!');
    
    const [result] = await conn.execute('SELECT "Direct connection works!" as message');
    console.log('Query result:', result[0]);
    
    await conn.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

simpleTest();