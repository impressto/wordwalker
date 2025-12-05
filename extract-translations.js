#!/usr/bin/env node

/**
 * Script to extract category-based translations from answer translations
 * by matching correctAnswer values from question files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the full translations object
import { translations } from './src/config/translations/answers/index.js';

// Category question files to process
const categories = [
  'food',
  'shopping',
  'entertainment',
  'accommodation',
  'transportation',
  'directions',
  'emergencies',
  'greetings',
  'numbers',
  'grammar',
  'beach',
  'animals',
  'people',
  'daily_routines',
  'restaurant',
  'weather'
];

async function extractTranslationsForCategory(category) {
  console.log(`\n📂 Processing category: ${category}`);
  
  try {
    // Dynamically import the question file
    const questionModule = await import(`./src/config/questions/${category}.js`);
    const questionKey = `${category.charAt(0) + category.slice(1).replace(/_./g, m => m.charAt(1).toUpperCase())}Questions`;
    const questions = questionModule[questionKey] || questionModule.default;
    
    if (!questions || !Array.isArray(questions)) {
      console.log(`  ⚠️  No questions array found for ${category}`);
      return null;
    }

    // Extract unique correctAnswer values
    const correctAnswers = new Set();
    questions.forEach(q => {
      if (q.correctAnswer) {
        correctAnswers.add(q.correctAnswer);
      }
    });

    console.log(`  ✓ Found ${correctAnswers.size} unique correct answers`);

    // Build the translations object for this category
    const categoryTranslations = {};
    let foundCount = 0;
    let missingCount = 0;
    const missing = [];

    correctAnswers.forEach(answer => {
      if (translations[answer]) {
        categoryTranslations[answer] = translations[answer];
        foundCount++;
      } else {
        missingCount++;
        missing.push(answer);
      }
    });

    console.log(`  ✓ Found ${foundCount} translations`);
    if (missingCount > 0) {
      console.log(`  ⚠️  Missing ${missingCount} translations:`);
      missing.forEach(m => console.log(`     - "${m}"`));
    }

    return {
      category,
      translations: categoryTranslations,
      stats: { total: correctAnswers.size, found: foundCount, missing: missingCount }
    };
  } catch (error) {
    console.log(`  ❌ Error processing ${category}:`, error.message);
    return null;
  }
}

async function generateTranslationFiles() {
  console.log('🚀 Starting translation extraction...\n');
  
  const results = [];
  
  // Process each category
  for (const category of categories) {
    const result = await extractTranslationsForCategory(category);
    if (result) {
      results.push(result);
    }
  }

  // Create the output directory
  const outputDir = path.join(__dirname, 'src/config/translations/answers');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate individual category files
  console.log('\n📝 Writing translation files...\n');
  
  for (const result of results) {
    const { category, translations, stats } = result;
    
    // Generate the file content
    const fileContent = `/**
 * ${category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')} Category Answer Translations
 * Auto-generated
 * Category: ${category}
 * Total translations: ${stats.found}
 */

export const ${category.replace(/_/g, '')}AnswerTranslations = ${JSON.stringify(translations, null, 2)};
`;

    const filePath = path.join(outputDir, `${category}.js`);
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`  ✓ Created ${category}.js (${stats.found} translations)`);
  }

  // Generate index file that exports all translations combined
  console.log('\n📝 Writing index file...\n');
  
  const indexImports = results.map(r => 
    `import { ${r.category.replace(/_/g, '')}AnswerTranslations } from './${r.category}.js';`
  ).join('\n');

  const indexExports = results.map(r => 
    `  ...${r.category.replace(/_/g, '')}AnswerTranslations,`
  ).join('\n');

  const indexContent = `/**
 * Unified Answer Translations Index
 * Aggregates all category-based answer translations
 * 
 * This file provides a unified interface while organizing translations
 * by category for better maintainability.
 */

${indexImports}

/**
 * Combined translations object
 * Maps Spanish words/phrases to their English equivalents
 */
export const translations = {
${indexExports}
};

/**
 * Get translation for a Spanish word/phrase
 * @param {string} spanish - The Spanish word or phrase
 * @returns {string|undefined} The English translation or undefined if not found
 */
export function getTranslation(spanish) {
  return translations[spanish];
}

/**
 * Check if a translation exists
 * @param {string} spanish - The Spanish word or phrase
 * @returns {boolean} True if translation exists
 */
export function hasTranslation(spanish) {
  return spanish in translations;
}
`;

  fs.writeFileSync(path.join(outputDir, 'index.js'), indexContent, 'utf8');
  console.log('  ✓ Created index.js');

  // Generate summary
  console.log('\n📊 Summary:\n');
  const totalTranslations = results.reduce((sum, r) => sum + r.stats.found, 0);
  const totalMissing = results.reduce((sum, r) => sum + r.stats.missing, 0);
  
  console.log(`  Total categories: ${results.length}`);
  console.log(`  Total translations: ${totalTranslations}`);
  console.log(`  Total missing: ${totalMissing}`);
  
  console.log('\n✅ Translation extraction complete!\n');
  console.log('📁 Files created in: src/config/translations/answers/\n');
  console.log('Next steps:');
  console.log('  1. Review the generated files');
  console.log('  2. Update imports in components to use:');
  console.log('     import { translations } from \'../config/translations/answers\';');
  console.log('  3. Optionally backup and remove old answer-translations.js\n');
}

// Run the script
generateTranslationFiles().catch(console.error);
