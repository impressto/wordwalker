#!/usr/bin/env node

/**
 * Test script to verify translation functionality
 * Tests that all translations are accessible and search works correctly
 */

import { translations, getTranslation, hasTranslation } from './src/config/answer-translations/index.js';

console.log('🧪 Testing Answer Translations...\n');

// Test 1: Check that translations object exists and has content
console.log('Test 1: Translations object exists');
if (Object.keys(translations).length > 0) {
  console.log(`  ✓ Found ${Object.keys(translations).length} translations\n`);
} else {
  console.log('  ❌ Translations object is empty!\n');
  process.exit(1);
}

// Test 2: Sample translations from different categories
console.log('Test 2: Sample translations from different categories');
const samples = [
  { spanish: 'la manzana', expected: 'the apple', category: 'food' },
  { spanish: 'la camiseta', expected: 'the t-shirt', category: 'shopping' },
  { spanish: 'el piano', expected: 'the piano', category: 'entertainment' },
  { spanish: 'el hotel', expected: 'the hotel', category: 'accommodation' },
  { spanish: 'el autobús', expected: 'the bus', category: 'transportation' },
];

let passed = 0;
let failed = 0;

samples.forEach(({ spanish, expected, category }) => {
  const result = translations[spanish];
  if (result === expected) {
    console.log(`  ✓ ${category}: "${spanish}" = "${result}"`);
    passed++;
  } else {
    console.log(`  ❌ ${category}: "${spanish}" expected "${expected}" but got "${result}"`);
    failed++;
  }
});

console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

// Test 3: Helper functions
console.log('Test 3: Helper functions');

const testWord = 'la sandía';
const translation = getTranslation(testWord);
const exists = hasTranslation(testWord);

if (translation && exists) {
  console.log(`  ✓ getTranslation("${testWord}") = "${translation}"`);
  console.log(`  ✓ hasTranslation("${testWord}") = ${exists}\n`);
} else {
  console.log(`  ❌ Helper functions not working correctly\n`);
  failed++;
}

// Test 4: Missing translation returns undefined
console.log('Test 4: Missing translation behavior');
const missingWord = 'palabra_que_no_existe_xyz';
const missingTranslation = getTranslation(missingWord);
const missingExists = hasTranslation(missingWord);

if (missingTranslation === undefined && missingExists === false) {
  console.log(`  ✓ getTranslation() returns undefined for missing word`);
  console.log(`  ✓ hasTranslation() returns false for missing word\n`);
} else {
  console.log(`  ❌ Missing translation handling failed\n`);
  failed++;
}

// Test 5: Search functionality simulation
console.log('Test 5: Search functionality (Spanish → English)');
const searchTerm = 'manzana';
const searchResults = Object.entries(translations)
  .filter(([spanish, english]) => spanish.toLowerCase().includes(searchTerm))
  .slice(0, 5);

if (searchResults.length > 0) {
  console.log(`  ✓ Found ${searchResults.length} results for "${searchTerm}":`);
  searchResults.forEach(([spanish, english]) => {
    console.log(`    - ${spanish} = ${english}`);
  });
  console.log();
} else {
  console.log(`  ❌ Search failed for "${searchTerm}"\n`);
  failed++;
}

// Test 6: Reverse search (English → Spanish)
console.log('Test 6: Reverse search (English → Spanish)');
const englishSearchTerm = 'apple';
const reverseResults = Object.entries(translations)
  .filter(([spanish, english]) => english.toLowerCase().includes(englishSearchTerm))
  .slice(0, 5);

if (reverseResults.length > 0) {
  console.log(`  ✓ Found ${reverseResults.length} results for "${englishSearchTerm}":`);
  reverseResults.forEach(([spanish, english]) => {
    console.log(`    - ${english} = ${spanish}`);
  });
  console.log();
} else {
  console.log(`  ❌ Reverse search failed for "${englishSearchTerm}"\n`);
  failed++;
}

// Final summary
console.log('═══════════════════════════════════════');
if (failed === 0) {
  console.log('✅ All tests passed! Translations working correctly.');
  console.log('   - TranslationOverlay will work ✓');
  console.log('   - SearchDialog will work ✓');
  console.log('   - PathCanvas will work ✓');
} else {
  console.log(`❌ ${failed} test(s) failed!`);
  process.exit(1);
}
console.log('═══════════════════════════════════════\n');
