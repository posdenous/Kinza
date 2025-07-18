/**
 * Component Refactoring Utility
 * 
 * This script helps refactor React Native components to use the i18next translation system.
 * It identifies hardcoded strings in components and replaces them with translation keys.
 * 
 * Usage: 
 * node refactorToTranslations.js [path/to/component]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  extractedKeysFile: path.resolve(__dirname, '../translations/extracted_keys.json'),
  backupSuffix: '.bak',
};

// Function to load extracted translation keys
const loadTranslationKeys = () => {
  try {
    if (fs.existsSync(CONFIG.extractedKeysFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.extractedKeysFile, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading translation keys: ${error.message}`);
  }
  
  return {};
};

// Function to flatten nested translation keys
const flattenTranslationKeys = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenTranslationKeys(obj[key], prefixedKey));
    } else {
      acc[obj[key]] = prefixedKey;
    }
    
    return acc;
  }, {});
};

// Function to check if a component already imports useTranslation
const hasTranslationImport = (content) => {
  return /import\s+.*\{\s*useTranslation\s*\}\s+from\s+['"]react-i18next['"]/g.test(content);
};

// Function to add useTranslation import if needed
const addTranslationImport = (content) => {
  if (!hasTranslationImport(content)) {
    // Find the last import statement
    const lastImportIndex = content.lastIndexOf('import');
    if (lastImportIndex !== -1) {
      const endOfImportIndex = content.indexOf(';', lastImportIndex);
      if (endOfImportIndex !== -1) {
        return (
          content.substring(0, endOfImportIndex + 1) +
          "\nimport { useTranslation } from 'react-i18next';" +
          content.substring(endOfImportIndex + 1)
        );
      }
    }
  }
  
  return content;
};

// Function to add t function to component
const addTranslationHook = (content) => {
  // Check if the component already has the useTranslation hook
  if (content.includes('const { t }') || content.includes('const {t}')) {
    return content;
  }
  
  // Find the component function
  const functionMatch = content.match(/function\s+(\w+)\s*\(/);
  const arrowFunctionMatch = content.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
  
  if (functionMatch || arrowFunctionMatch) {
    // Find where to insert the hook
    let insertIndex;
    
    // Look for the first line after function declaration
    if (functionMatch) {
      insertIndex = content.indexOf('{', content.indexOf(functionMatch[0])) + 1;
    } else {
      insertIndex = content.indexOf('{', content.indexOf(arrowFunctionMatch[0])) + 1;
    }
    
    if (insertIndex !== -1) {
      return (
        content.substring(0, insertIndex) +
        "\n  const { t } = useTranslation();" +
        content.substring(insertIndex)
      );
    }
  }
  
  return content;
};

// Function to replace hardcoded strings with translation keys
const replaceHardcodedStrings = (content, translationMap) => {
  let modifiedContent = content;
  
  // Sort strings by length (longest first) to avoid partial replacements
  const sortedStrings = Object.keys(translationMap).sort((a, b) => b.length - a.length);
  
  for (const text of sortedStrings) {
    const key = translationMap[text];
    
    // Skip very short strings to avoid false positives
    if (text.length < 3) continue;
    
    // Different patterns to replace
    const patterns = [
      // Text components with exact content
      new RegExp(`<Text[^>]*>(\\s*${escapeRegExp(text)}\\s*)</Text>`, 'g'),
      // Text within quotes in JSX attributes
      new RegExp(`=\\s*["']${escapeRegExp(text)}["']`, 'g'),
      // String literals in JS
      new RegExp(`["']${escapeRegExp(text)}["']`, 'g'),
    ];
    
    // Apply each pattern
    patterns.forEach(pattern => {
      modifiedContent = modifiedContent.replace(pattern, (match) => {
        // Skip if it's already using t function
        if (match.includes('t(') || match.includes('{t(')) {
          return match;
        }
        
        if (match.startsWith('<Text')) {
          return match.replace(text, `{t('${key}')}`);
        } else if (match.includes('=')) {
          return match.replace(`"${text}"`, `{t('${key}')}`).replace(`'${text}'`, `{t('${key}')}`);
        } else {
          return match.replace(`"${text}"`, `t('${key}')`).replace(`'${text}'`, `t('${key}')`);
        }
      });
    });
  }
  
  return modifiedContent;
};

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to refactor a component file
const refactorComponent = (filePath) => {
  console.log(`Refactoring component: ${filePath}`);
  
  // Read the component file
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Create a backup
  const backupPath = `${filePath}${CONFIG.backupSuffix}`;
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`Backup created: ${backupPath}`);
  
  // Load translation keys
  const translationKeys = loadTranslationKeys();
  const translationMap = flattenTranslationKeys(translationKeys);
  
  // Refactor the component
  let modifiedContent = content;
  
  // Step 1: Add import if needed
  modifiedContent = addTranslationImport(modifiedContent);
  
  // Step 2: Add useTranslation hook
  modifiedContent = addTranslationHook(modifiedContent);
  
  // Step 3: Replace hardcoded strings
  modifiedContent = replaceHardcodedStrings(modifiedContent, translationMap);
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, modifiedContent, 'utf8');
  
  console.log(`Component refactored: ${filePath}`);
  
  // Return stats
  return {
    original: content,
    modified: modifiedContent,
    changed: content !== modifiedContent,
  };
};

// Main function
const main = () => {
  // Get target path from command line arguments
  const targetPath = process.argv[2];
  
  if (!targetPath) {
    console.error('Please provide a path to a component file');
    process.exit(1);
  }
  
  if (!fs.existsSync(targetPath)) {
    console.error(`File not found: ${targetPath}`);
    process.exit(1);
  }
  
  // Refactor the component
  const result = refactorComponent(targetPath);
  
  if (result.changed) {
    console.log('Component successfully refactored!');
  } else {
    console.log('No changes were made to the component.');
  }
};

// Run the script
main();
