const fs = require('fs');

// Read the file
let content = fs.readFileSync('/Users/najmihamdi/waapify-ghl/src/index.ts', 'utf8');

// Replace all remaining Storage references with Database
const replacements = [
  // Storage method calls
  { from: /Storage\.getWaapifyConfig/g, to: 'Database.getWaapifyConfig' },
  { from: /Storage\.getAIChatbotConfig/g, to: 'Database.getAIConfig' },
  { from: /Storage\.saveAIChatbotConfig/g, to: 'Database.saveAIConfig' },
  { from: /Storage\.getAll\(\)/g, to: 'Database.getAllInstallations()' },
  { from: /Storage\.save\(/g, to: 'Database.saveInstallation(' },
  { from: /Storage\.saveWaapifyConfig/g, to: 'Database.saveWaapifyConfig' },
  { from: /Storage\.getTokenForLocation/g, to: 'Database.getTokenForLocation' },
  
  // Fix property references that weren't updated
  { from: /inst\.locationId/g, to: 'inst.location_id' },
  { from: /inst\.companyId/g, to: 'inst.company_id' },
  { from: /installation\.locationId/g, to: 'installation.location_id' },
  { from: /installation\.companyId/g, to: 'installation.company_id' },
  
  // Fix legacy references
  { from: /inst\.location_id === locationId \|\| inst\.company_id === companyId/g, to: 'inst.location_id === locationId || inst.company_id === companyId' },
  
  // Fix AI config property references
  { from: /aiConfig\.openaiApiKey/g, to: 'aiConfig.openai_api_key' },
];

// Apply replacements
replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// Fix specific issues with await calls
content = content.replace(/const installations = Database\.getAllInstallations\(\);/g, 'const installations = await Database.getAllInstallations();');
content = content.replace(/const waapifyConfig = Database\.getWaapifyConfig\(/g, 'const waapifyConfig = await Database.getWaapifyConfig(');
content = content.replace(/const aiConfig = Database\.getAIConfig\(/g, 'const aiConfig = await Database.getAIConfig(');
content = content.replace(/Database\.saveInstallation\(/g, 'await Database.saveInstallation(');
content = content.replace(/Database\.saveWaapifyConfig\(/g, 'await Database.saveWaapifyConfig(');
content = content.replace(/Database\.saveAIConfig\(/g, 'await Database.saveAIConfig(');
content = content.replace(/const config = Database\.getAIConfig\(/g, 'const config = await Database.getAIConfig(');
content = content.replace(/let token = Database\.getTokenForLocation\(/g, 'let token = await Database.getTokenForLocation(');
content = content.replace(/token = Database\.getTokenForLocation\(/g, 'token = await Database.getTokenForLocation(');

// Write back to file
fs.writeFileSync('/Users/najmihamdi/waapify-ghl/src/index.ts', content, 'utf8');

console.log('✅ Storage migration fix completed successfully!');