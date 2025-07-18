/**
 * Translation Validation Script
 * 
 * This script validates that all translation keys exist in all supported languages
 * and generates a report of missing translations.
 * 
 * Usage: 
 * node validateTranslations.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  translationsDir: path.resolve(__dirname, '../translations'),
  supportedLanguages: ['en', 'de', 'it'],
  reportFile: path.resolve(__dirname, '../translations/validation_report.md'),
};

// Main function
const main = async () => {
  console.log('Starting translation validation...');
  
  // Load all translation files
  const translations = {};
  
  for (const lang of CONFIG.supportedLanguages) {
    const filePath = path.join(CONFIG.translationsDir, `${lang}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Translation file not found: ${filePath}`);
      continue;
    }
    
    try {
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error(`Error parsing translation file ${filePath}:`, error);
    }
  }
  
  // Collect all keys from all languages
  const allKeys = new Set();
  const flattenedKeys = {};
  
  for (const lang of Object.keys(translations)) {
    flattenedKeys[lang] = {};
    flattenKeys(translations[lang], '', flattenedKeys[lang], allKeys);
  }
  
  // Check for missing translations
  const missingTranslations = {};
  
  for (const lang of CONFIG.supportedLanguages) {
    missingTranslations[lang] = [];
    
    for (const key of allKeys) {
      if (!flattenedKeys[lang][key]) {
        missingTranslations[lang].push(key);
      }
    }
  }
  
  // Generate report
  generateReport(missingTranslations, allKeys.size);
  
  console.log('Translation validation complete!');
  console.log(`Report generated at: ${CONFIG.reportFile}`);
};

// Function to flatten nested translation keys
const flattenKeys = (obj, prefix, result, allKeys) => {
  for (const key of Object.keys(obj)) {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenKeys(obj[key], prefixedKey, result, allKeys);
    } else {
      result[prefixedKey] = obj[key];
      allKeys.add(prefixedKey);
    }
  }
};

// Function to generate a validation report
const generateReport = (missingTranslations, totalKeys) => {
  const totalMissing = Object.values(missingTranslations)
    .reduce((sum, keys) => sum + keys.length, 0);
  
  const reportContent = `# Translation Validation Report

## Summary

- Total translation keys: ${totalKeys}
- Total missing translations: ${totalMissing}
- Completeness: ${Math.round((1 - totalMissing / (totalKeys * CONFIG.supportedLanguages.length)) * 100)}%

## Missing Translations by Language

${CONFIG.supportedLanguages.map(lang => {
    const missing = missingTranslations[lang] || [];
    return `### ${lang.toUpperCase()} (${missing.length} missing)

${missing.length > 0 
  ? missing.map(key => `- \`${key}\``).join('\n')
  : 'No missing translations!'}
`;
  }).join('\n')}

## Next Steps

1. Add the missing translations to the respective language files.
2. Run this validation script again to ensure completeness.
3. Test the application with different languages to verify correct rendering.

## Language Completeness Rule

All UI strings must exist in all supported locales (EN, DE, IT) before a feature is marked production-ready.
`;

  // Write report to file
  fs.writeFileSync(CONFIG.reportFile, reportContent, 'utf8');
};

// Run the script
main().catch(error => {
  console.error('Error running validation:', error);
  process.exit(1);
});
