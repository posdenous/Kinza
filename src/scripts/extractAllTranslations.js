/**
 * Extract All Translations Script
 * 
 * This script runs the translation extraction process on the entire codebase
 * and generates a report of all UI text that needs to be translated.
 * 
 * Usage: 
 * node extractAllTranslations.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  srcDir: path.resolve(__dirname, '../'),
  componentsDir: path.resolve(__dirname, '../components'),
  screensDir: path.resolve(__dirname, '../screens'),
  extractScript: path.resolve(__dirname, './extractTranslations.js'),
  outputDir: path.resolve(__dirname, '../translations'),
  reportFile: path.resolve(__dirname, '../translations/extraction_report.md'),
};

// Main function
const main = async () => {
  console.log('Starting translation extraction process...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Extract translations from components
  console.log('Extracting translations from components...');
  try {
    execSync(`node ${CONFIG.extractScript} ${CONFIG.componentsDir}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error extracting translations from components:', error);
  }
  
  // Extract translations from screens
  console.log('Extracting translations from screens...');
  try {
    execSync(`node ${CONFIG.extractScript} ${CONFIG.screensDir}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error extracting translations from screens:', error);
  }
  
  // Generate report
  generateReport();
  
  console.log('Translation extraction process complete!');
  console.log(`Report generated at: ${CONFIG.reportFile}`);
};

// Function to generate a report of the extraction process
const generateReport = () => {
  // Load extracted keys
  const extractedKeysPath = path.join(CONFIG.outputDir, 'extracted_keys.json');
  if (!fs.existsSync(extractedKeysPath)) {
    console.error('No extracted keys found. Run the extraction script first.');
    return;
  }
  
  const extractedKeys = JSON.parse(fs.readFileSync(extractedKeysPath, 'utf8'));
  
  // Count keys by category
  const categories = {};
  const flattenKeys = (obj, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // This is a category
        categories[prefixedKey] = Object.keys(obj[key]).length;
        flattenKeys(obj[key], prefixedKey);
      }
    });
  };
  
  flattenKeys(extractedKeys);
  
  // Generate markdown report
  const reportContent = `# Translation Extraction Report

## Summary

Total extracted strings: ${Object.values(categories).reduce((sum, count) => sum + count, 0)}

## Categories

${Object.entries(categories)
  .sort(([, countA], [, countB]) => countB - countA)
  .map(([category, count]) => `- **${category}**: ${count} strings`)
  .join('\n')}

## Next Steps

1. Review the extracted strings in \`translations/extracted_keys.json\`
2. Add missing translations to the language files:
   - \`translations/en.json\` (English)
   - \`translations/de.json\` (German)
   - \`translations/it.json\` (Italian)
3. Run the component refactoring script to update components to use translation keys:
   \`\`\`
   node src/scripts/refactorToTranslations.js path/to/component.tsx
   \`\`\`

## Validation

To validate translation completeness, use the TranslationContext's \`validateTranslationCompleteness\` method.

## Missing Translations

To see which components still need refactoring, check the extraction report in \`translations/translation_report.txt\`.
`;

  // Write report to file
  fs.writeFileSync(CONFIG.reportFile, reportContent, 'utf8');
};

// Run the script
main().catch(error => {
  console.error('Error running extraction process:', error);
  process.exit(1);
});
