const fs = require('fs');

// Read the file
let content = fs.readFileSync('/Users/najmihamdi/waapify-ghl/src/index.ts', 'utf8');

// Fix the remaining issues
const fixes = [
  // Remove double await
  { from: /await await Database/g, to: 'await Database' },
  
  // Fix property names
  { from: /aiConfig\.openaiApiKey/g, to: 'aiConfig.openai_api_key' },
  
  // Fix test installation object
  { 
    from: /const testInstallation = \{\s*companyId: companyId \|\| "test_company_456",\s*locationId: locationId \|\| "test_location_123",\s*access_token: "test_token",\s*refresh_token: "test_refresh",\s*expires_in: 3600\s*\};/g,
    to: `const testInstallation: Installation = {
      company_id: companyId || "test_company_456",
      location_id: locationId || "test_location_123",
      access_token: "test_token",
      refresh_token: "test_refresh",
      expires_in: 3600
    };`
  },
  
  // Fix backup installation object
  {
    from: /await Database\.saveInstallation\(\{\s*companyId: backup\.companyId,\s*locationId: backup\.locationId,\s*access_token: 'restored_token',\s*refresh_token: 'restored_refresh',\s*expires_in: 86400\s*\}\);/g,
    to: `await Database.saveInstallation({
            company_id: backup.companyId,
            location_id: backup.locationId,
            access_token: 'restored_token',
            refresh_token: 'restored_refresh',
            expires_in: 86400
          } as Installation);`
  },
  
  // Fix the remaining waapifyConfig property access (remove it)
  { from: /inst\.waapifyConfig\?\.instanceId/g, to: 'null' },
  
  // Fix checkKeywordTriggers call - make keywords optional
  { from: /checkKeywordTriggers\(messageText, aiConfig\.keywords\)/g, to: 'checkKeywordTriggers(messageText, aiConfig.keywords || "")' },
  
  // Fix async map issues - convert to proper async mapping
  {
    from: /const currentBackup = installations\.map\(inst => \(\{\s*companyId: inst\.company_id,\s*locationId: inst\.location_id,\s*waapifyConfig: await Database\.getWaapifyConfig\(inst\.company_id, inst\.location_id \|\| ''\)\s*\}\)\)\.filter\(backup => backup\.waapifyConfig\);/g,
    to: `// Create backup asynchronously
    const currentBackup = [];
    for (const inst of installations) {
      const waapifyConfig = await Database.getWaapifyConfig(inst.company_id, inst.location_id || '');
      if (waapifyConfig) {
        currentBackup.push({
          companyId: inst.company_id,
          locationId: inst.location_id,
          waapifyConfig
        });
      }
    }`
  },
  
  // Fix admin backup endpoint mapping
  {
    from: /const backupData = installations\.map\(inst => \(\{\s*companyId: inst\.company_id,\s*locationId: inst\.location_id,\s*waapifyConfig: await Database\.getWaapifyConfig\(inst\.company_id, inst\.location_id \|\| ''\)\s*\}\)\)\.filter\(backup => backup\.waapifyConfig\);/g,
    to: `// Create backup data asynchronously
    const backupData = [];
    for (const inst of installations) {
      const waapifyConfig = await Database.getWaapifyConfig(inst.company_id, inst.location_id || '');
      if (waapifyConfig) {
        backupData.push({
          companyId: inst.company_id,
          locationId: inst.location_id,
          waapifyConfig
        });
      }
    }`
  },
  
  // Fix Database.saveWaapifyConfig call in backup
  { 
    from: /await Database\.saveWaapifyConfig\(backup\.companyId, backup\.locationId, backup\.waapifyConfig\);/g,
    to: `const installation = await Database.getInstallation(backup.companyId, backup.locationId);
              if (installation && installation.id) {
                const waapifyConfig: WaapifyConfig = {
                  installation_id: installation.id,
                  company_id: backup.companyId,
                  location_id: backup.locationId,
                  access_token: backup.waapifyConfig.access_token,
                  instance_id: backup.waapifyConfig.instance_id,
                  whatsapp_number: backup.waapifyConfig.whatsapp_number,
                  is_active: true
                };
                await Database.saveWaapifyConfig(waapifyConfig);
              }`
  }
];

// Apply fixes
fixes.forEach(fix => {
  content = content.replace(fix.from, fix.to);
});

// Write back to file
fs.writeFileSync('/Users/najmihamdi/waapify-ghl/src/index.ts', content, 'utf8');

console.log('✅ Final fixes applied successfully!');