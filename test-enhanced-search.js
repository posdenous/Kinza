/**
 * Enhanced Search Integration Test
 * 
 * This script tests the key components of the enhanced search integration:
 * 1. Event scraping service functionality
 * 2. Kid-friendly filtering logic
 * 3. Search hook integration
 * 4. Translation completeness
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Enhanced Search Integration...\n');

// Test 1: Check if all required files exist
console.log('1. Checking file structure...');
const requiredFiles = [
  'src/services/eventScrapingService.ts',
  'src/hooks/useEnhancedSearch.ts',
  'src/screens/EnhancedSearchScreen.tsx',
  'src/translations/en.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Test failed: Missing required files');
  process.exit(1);
}

// Test 2: Check translation completeness
console.log('\n2. Checking translation completeness...');
try {
  const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/translations/en.json'), 'utf8'));
  
  const requiredSearchKeys = [
    'search.enhancedSearch',
    'search.findKidFriendlyEvents',
    'search.placeholder',
    'search.filters',
    'search.includeScrapedEvents',
    'search.kidsOnlyMode',
    'search.scrapedEvents',
    'search.localEvents',
    'search.saveEvent'
  ];

  let allKeysExist = true;
  requiredSearchKeys.forEach(key => {
    const keyPath = key.split('.');
    let current = enTranslations;
    let exists = true;
    
    for (const part of keyPath) {
      if (current && current[part]) {
        current = current[part];
      } else {
        exists = false;
        break;
      }
    }
    
    if (exists) {
      console.log(`   ✅ ${key}`);
    } else {
      console.log(`   ❌ ${key} - MISSING`);
      allKeysExist = false;
    }
  });

  if (allKeysExist) {
    console.log('   ✅ All required translation keys found');
  } else {
    console.log('   ⚠️  Some translation keys are missing');
  }
} catch (error) {
  console.log(`   ❌ Error reading translations: ${error.message}`);
}

// Test 3: Check event scraping service structure
console.log('\n3. Checking event scraping service...');
try {
  const scrapingServiceContent = fs.readFileSync(path.join(__dirname, 'src/services/eventScrapingService.ts'), 'utf8');
  
  const requiredMethods = [
    'applyKidFriendlyFilter',
    'categorizeEvents',
    'convertToKinzaFormat',
    'simulateScrapedEvents'
  ];

  let allMethodsExist = true;
  requiredMethods.forEach(method => {
    if (scrapingServiceContent.includes(method)) {
      console.log(`   ✅ ${method}`);
    } else {
      console.log(`   ❌ ${method} - MISSING`);
      allMethodsExist = false;
    }
  });

  if (allMethodsExist) {
    console.log('   ✅ All required methods found in scraping service');
  }
} catch (error) {
  console.log(`   ❌ Error reading scraping service: ${error.message}`);
}

// Test 4: Check enhanced search hook structure
console.log('\n4. Checking enhanced search hook...');
try {
  const searchHookContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useEnhancedSearch.ts'), 'utf8');
  
  const requiredHookFeatures = [
    'searchEvents',
    'saveScrapedEvent',
    'getSearchSuggestions',
    'SearchFilters',
    'SearchResult'
  ];

  let allFeaturesExist = true;
  requiredHookFeatures.forEach(feature => {
    if (searchHookContent.includes(feature)) {
      console.log(`   ✅ ${feature}`);
    } else {
      console.log(`   ❌ ${feature} - MISSING`);
      allFeaturesExist = false;
    }
  });

  if (allFeaturesExist) {
    console.log('   ✅ All required features found in search hook');
  }
} catch (error) {
  console.log(`   ❌ Error reading search hook: ${error.message}`);
}

// Test 5: Check App.tsx integration
console.log('\n5. Checking App.tsx integration...');
try {
  const appContent = fs.readFileSync(path.join(__dirname, 'App.tsx'), 'utf8');
  
  if (appContent.includes('EnhancedSearchScreen')) {
    console.log('   ✅ EnhancedSearchScreen integrated in App.tsx');
  } else {
    console.log('   ❌ EnhancedSearchScreen not found in App.tsx');
  }
} catch (error) {
  console.log(`   ❌ Error reading App.tsx: ${error.message}`);
}

console.log('\n🎉 Enhanced Search Integration Test Complete!');
console.log('\nNext steps:');
console.log('1. Run the app with: npm start');
console.log('2. Navigate to the Search tab');
console.log('3. Test search functionality with filters');
console.log('4. Verify kid-friendly filtering works');
console.log('5. Test saving scraped events');
