// Check actual database content on server vs local
const mysql = require('mysql2/promise');

async function checkDatabaseContent() {
  console.log('📊 === CHECKING ACTUAL DATABASE CONTENT ===\n');
  
  try {
    const db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'waapify_user',
      password: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      database: 'waapify_ghl'
    });
    
    // Check all installations
    console.log('1️⃣ ALL INSTALLATIONS:');
    const [installations] = await db.execute('SELECT * FROM installations ORDER BY id DESC');
    if (installations.length === 0) {
      console.log('❌ No installations found!');
    } else {
      installations.forEach((inst, index) => {
        console.log(`   ${index + 1}. ID: ${inst.id}, Company: ${inst.company_id}, Location: ${inst.location_id}`);
        console.log(`      Access Token: ${inst.access_token}`);
        console.log(`      Created: ${inst.installed_at}`);
      });
    }
    
    // Check all waapify configs
    console.log('\n2️⃣ ALL WAAPIFY CONFIGS:');
    const [configs] = await db.execute('SELECT * FROM waapify_configs ORDER BY id DESC');
    if (configs.length === 0) {
      console.log('❌ No waapify configs found! THIS IS THE PROBLEM!');
    } else {
      configs.forEach((config, index) => {
        console.log(`   ${index + 1}. ID: ${config.id}, Installation: ${config.installation_id}`);
        console.log(`      Company: ${config.company_id}, Location: ${config.location_id}`);
        console.log(`      Access Token: ${config.access_token.substring(0, 10)}...`);
        console.log(`      Instance ID: ${config.instance_id}`);
        console.log(`      Active: ${config.is_active}`);
        console.log(`      Created: ${config.created_at}`);
      });
    }
    
    // Check specific location
    console.log('\n3️⃣ SPECIFIC LOCATION CHECK:');
    const targetCompanyId = 'NQFaKZYtxW6gENuYYALt';
    const targetLocationId = 'rjsdYp4AhllL4EJDzQCP';
    
    const [specificInstall] = await db.execute(
      'SELECT * FROM installations WHERE company_id = ? AND location_id = ?',
      [targetCompanyId, targetLocationId]
    );
    
    if (specificInstall.length === 0) {
      console.log('❌ No installation for target location!');
    } else {
      console.log('✅ Found installation:', {
        id: specificInstall[0].id,
        company_id: specificInstall[0].company_id,
        location_id: specificInstall[0].location_id,
        access_token: specificInstall[0].access_token
      });
      
      // Check if waapify config exists for this installation
      const [specificConfig] = await db.execute(
        'SELECT * FROM waapify_configs WHERE company_id = ? AND location_id = ?',
        [targetCompanyId, targetLocationId]
      );
      
      if (specificConfig.length === 0) {
        console.log('❌ NO WAAPIFY CONFIG for this installation! External Auth failed to save!');
      } else {
        console.log('✅ Found waapify config:', {
          id: specificConfig[0].id,
          access_token: specificConfig[0].access_token.substring(0, 10) + '...',
          instance_id: specificConfig[0].instance_id,
          is_active: specificConfig[0].is_active
        });
      }
    }
    
    await db.end();
    
  } catch (error) {
    console.error('❌ Database check error:', error.message);
  }
  
  console.log('\n🎯 === CONCLUSION ===');
  console.log('If waapify_configs table is empty or missing target location:');
  console.log('→ External Auth is NOT saving credentials to database');
  console.log('→ SMS fails because no Waapify config found');
  console.log('→ Need to debug saveWaapifyConfig() function');
  
  console.log('\nIf waapify_configs has data:');
  console.log('→ External Auth is working');
  console.log('→ SMS failure is due to network/API issues');
  console.log('→ Need to debug Waapify API connection');
}

checkDatabaseContent();