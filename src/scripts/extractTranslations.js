/**
 * Translation Extraction Script
 * 
 * This script helps extract translatable text from React Native components
 * and generates translation keys for use with i18next.
 * 
 * Usage: 
 * node extractTranslations.js [path/to/component]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  srcDir: path.resolve(__dirname, '../'),
  outputFile: path.resolve(__dirname, '../translations/extracted_keys.json'),
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.git',
    'translations',
    'scripts',
    '__tests__',
  ],
  componentExtensions: ['.tsx', '.jsx'],
};

// Regular expressions for finding translatable text
const TEXT_PATTERNS = [
  // Text components with content
  /<Text[^>]*>([^<{]+)<\/Text>/g,
  // Text components with simple variables
  /<Text[^>]*>([^<]*{[^}]+}[^<]*)<\/Text>/g,
  // Button titles
  /title=["']([^"']+)["']/g,
  // Placeholder text
  /placeholder=["']([^"']+)["']/g,
  // Label text
  /label=["']([^"']+)["']/g,
  // Alert messages
  /alert\(["']([^"']+)["']\)/g,
  // Error messages
  /errorMessage=["']([^"']+)["']/g,
  // String literals in JSX that might be UI text
  />\s*["']([^"'<>]+)["']\s*</g,
];

// Patterns to ignore (common non-translatable strings)
const IGNORE_PATTERNS = [
  /^[0-9.]+$/,  // Numbers
  /^https?:\/\//,  // URLs
  /^#[0-9a-fA-F]{3,6}$/,  // Color codes
  /^[a-zA-Z0-9_-]+$/,  // Variable names, IDs
  /^\s*$/,  // Empty strings
  /^[<>=!&|%^*+-/\\]+$/,  // Operators
];

// Function to check if a string should be ignored
const shouldIgnore = (text) => {
  if (!text || text.length < 2) return true;
  
  return IGNORE_PATTERNS.some(pattern => pattern.test(text));
};

// Function to clean extracted text
const cleanText = (text) => {
  return text
    .trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/\{([^}]+)\}/g, '')  // Remove variables
    .trim();
};

// Function to generate a translation key from text
const generateTranslationKey = (text, context = '') => {
  // Convert text to snake_case
  const baseKey = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')  // Remove special characters
    .trim()
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .substring(0, 30);  // Limit length
  
  // Add context prefix if provided
  return context ? `${context}.${baseKey}` : baseKey;
};

// Function to extract translatable text from a file
const extractFromFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, path.extname(filePath));
  const extractedTexts = new Set();
  
  // Apply each regex pattern to find potential translatable text
  TEXT_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        const cleanedText = cleanText(match[1]);
        if (cleanedText && !shouldIgnore(cleanedText)) {
          extractedTexts.add(cleanedText);
        }
      }
    }
  });
  
  // Convert to array and generate translation keys
  return Array.from(extractedTexts).map(text => ({
    text,
    key: generateTranslationKey(text, fileName),
    file: filePath,
  }));
};

// Function to find all component files
const findComponentFiles = (targetPath) => {
  const isDirectory = fs.lstatSync(targetPath).isDirectory();
  
  if (isDirectory) {
    // Search for all component files in the directory
    const pattern = path.join(targetPath, '**', `*{${CONFIG.componentExtensions.join(',')}}`);
    return glob.sync(pattern, {
      ignore: CONFIG.ignorePatterns.map(p => path.join(targetPath, '**', p, '**')),
    });
  } else {
    // Single file mode
    return [targetPath];
  }
};

// Function to merge with existing translations
const mergeWithExisting = (extractedTranslations) => {
  let existingTranslations = {};
  
  // Try to load existing translations
  try {
    if (fs.existsSync(CONFIG.outputFile)) {
      existingTranslations = JSON.parse(fs.readFileSync(CONFIG.outputFile, 'utf8'));
    }
  } catch (error) {
    console.warn(`Warning: Could not load existing translations: ${error.message}`);
  }
  
  // Merge new translations with existing ones
  extractedTranslations.forEach(({ text, key }) => {
    if (!existingTranslations[key]) {
      existingTranslations[key] = text;
    }
  });
  
  return existingTranslations;
};

// Function to generate translation files
const generateTranslationFiles = (translations) => {
  // Create a structured translation object
  const structuredTranslations = {};
  
  Object.entries(translations).forEach(([key, value]) => {
    const keyParts = key.split('.');
    let current = structuredTranslations;
    
    // Build nested structure
    for (let i = 0; i < keyParts.length - 1; i++) {
      const part = keyParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the value at the leaf
    current[keyParts[keyParts.length - 1]] = value;
  });
  
  // Write to file
  fs.writeFileSync(
    CONFIG.outputFile,
    JSON.stringify(structuredTranslations, null, 2),
    'utf8'
  );
  
  console.log(`Translation keys written to ${CONFIG.outputFile}`);
  
  // Generate a report
  const reportFile = path.join(path.dirname(CONFIG.outputFile), 'translation_report.txt');
  const report = Object.entries(translations)
    .map(([key, value]) => `${key}: "${value}"`)
    .join('\n');
  
  fs.writeFileSync(reportFile, report, 'utf8');
  console.log(`Translation report written to ${reportFile}`);
};

// Main function
const main = () => {
  // Get target path from command line arguments
  const targetPath = process.argv[2] || CONFIG.srcDir;
  console.log(`Extracting translations from: ${targetPath}`);
  
  // Find all component files
  const files = findComponentFiles(targetPath);
  console.log(`Found ${files.length} component files`);
  
  // Extract translations from each file
  let allExtractedTexts = [];
  files.forEach(file => {
    const extractedTexts = extractFromFile(file);
    if (extractedTexts.length > 0) {
      console.log(`Found ${extractedTexts.length} translatable strings in ${path.basename(file)}`);
      allExtractedTexts = [...allExtractedTexts, ...extractedTexts];
    }
  });
  
  console.log(`Total extracted strings: ${allExtractedTexts.length}`);
  
  // Merge with existing translations
  const mergedTranslations = mergeWithExisting(allExtractedTexts);
  
  // Generate translation files
  generateTranslationFiles(mergedTranslations);
};

// Run the script
main();
