const fs = require('fs');

// Read the file
let content = fs.readFileSync('/Users/najmihamdi/waapify-ghl/src/index.ts', 'utf8');

// Define replacements
const replacements = [
  // Storage.getAll() calls
  {
    from: /const installations = Storage\.getAll\(\);/g,
    to: 'const installations = await Database.getAllInstallations();'
  },
  
  // Find installation by locationId
  {
    from: /installations\.find\(inst => inst\.locationId === locationId\)/g,
    to: 'installations.find(inst => inst.location_id === locationId)'
  },
  
  // Find installation by companyId  
  {
    from: /installations\.find\(inst => inst\.companyId === companyId\)/g,
    to: 'installations.find(inst => inst.company_id === companyId)'
  },
  
  // Waapify config calls
  {
    from: /Storage\.getWaapifyConfig\(([^,]+), ([^)]+)\)/g,
    to: 'await Database.getWaapifyConfig($1, $2)'
  },
  
  // AI config calls
  {
    from: /Storage\.getAIChatbotConfig\(([^,]+), ([^)]+)\)/g,
    to: 'await Database.getAIConfig($1, $2)' // Note: We need this method
  },
  
  // Installation properties
  {
    from: /installation\.companyId/g,
    to: 'installation.company_id'
  },
  {
    from: /installation\.locationId/g,
    to: 'installation.location_id'
  },
  
  // Waapify config properties
  {
    from: /waapifyConfig\.accessToken/g,
    to: 'waapifyConfig.access_token'
  },
  {
    from: /waapifyConfig\.instanceId/g,
    to: 'waapifyConfig.instance_id'
  },
  {
    from: /waapifyConfig\.whatsappNumber/g,
    to: 'waapifyConfig.whatsapp_number'
  },
  
  // Save calls
  {
    from: /Storage\.save\(([^)]+)\)/g,
    to: 'await Database.saveInstallation($1)'
  },
  
  // AI config save calls
  {
    from: /Storage\.saveAIChatbotConfig\(([^,]+), ([^,]+), ([^)]+)\)/g,
    to: 'await Database.saveAIConfig($3)' // We need to modify this
  }
];

// Apply replacements
replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// Write back to file
fs.writeFileSync('/Users/najmihamdi/waapify-ghl/src/index.ts', content, 'utf8');

console.log('✅ Storage migration completed successfully!');