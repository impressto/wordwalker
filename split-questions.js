#!/usr/bin/env node
/**
 * Script to split questions.js into separate category files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsFile = path.join(__dirname, 'src/config/questions.js');
const outputDir = path.join(__dirname, 'src/config/questions');

// Read the questions file
const content = fs.readFileSync(questionsFile, 'utf8');

// Extract the questions array
const questionsMatch = content.match(/export const questions = \[([\s\S]*?)\n\];/);
if (!questionsMatch) {
  console.error('Could not find questions array');
  process.exit(1);
}

const questionsContent = questionsMatch[1];

// Split by category comments
const categoryRegex = /\/\/ ([A-Z\s&]+) CATEGORY[^\n]*/g;
const categories = [];
let match;

while ((match = categoryRegex.exec(questionsContent)) !== null) {
  categories.push({
    name: match[1].trim(),
    position: match.index
  });
}

// Extract questions for each category
for (let i = 0; i < categories.length; i++) {
  const category = categories[i];
  const nextCategory = categories[i + 1];
  
  const start = category.position;
  const end = nextCategory ? nextCategory.position : questionsContent.length;
  
  const categoryContent = questionsContent.substring(start, end);
  
  // Get the category ID from the first question
  const idMatch = categoryContent.match(/category:\s*'([^']+)'/);
  if (!idMatch) {
    console.log(`Skipping ${category.name} - no category ID found`);
    continue;
  }
  
  const categoryId = idMatch[1];
  const fileName = `${categoryId}.js`;
  
  // Clean up the content - remove the comment line
  let cleanedContent = categoryContent.replace(/\/\/ [A-Z\s&]+ CATEGORY[^\n]*\n/, '');
  
  // Create the file content
  const fileContent = `/**
 * ${category.name} Category Questions
 * Category: ${categoryId}
 */

export const ${categoryId}Questions = [
${cleanedContent.trim()}
];
`;

  // Write the file
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(`✓ Created ${fileName}`);
}

console.log('\n✓ All category files created successfully!');
