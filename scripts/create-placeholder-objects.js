#!/usr/bin/env node

/**
 * Create placeholder object images for flash cards
 * Uses canvas to generate simple colored rectangles with text
 * No external dependencies required (uses node-canvas if available, otherwise provides instructions)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OBJECTS_DIR = path.join(__dirname, '..', 'public', 'images', 'flash-cards', 'objects');

// Object names and colors
const objects = [
  { name: 'la sandía', color: '#FF6B9D', emoji: '🍉' },
  { name: 'el plátano', color: '#FFE135', emoji: '🍌' },
  { name: 'la manzana', color: '#FF4444', emoji: '🍎' },
  { name: 'la naranja', color: '#FF8C00', emoji: '🍊' },
  { name: 'la piña', color: '#FFD700', emoji: '🍍' },
  { name: 'la pizza', color: '#FF6B6B', emoji: '🍕' },
  { name: 'la hamburguesa', color: '#8B4513', emoji: '🍔' },
  { name: 'el taco', color: '#F4A460', emoji: '🌮' },
  { name: 'el pollo', color: '#F5DEB3', emoji: '🍗' },
  { name: 'el helado', color: '#FFB6C1', emoji: '🍦' },
];

// Create directory if it doesn't exist
if (!fs.existsSync(OBJECTS_DIR)) {
  fs.mkdirSync(OBJECTS_DIR, { recursive: true });
}

console.log('🎨 Flash Cards Object Image Creator\n');
console.log('This will create placeholder SVG images that work perfectly in browsers.\n');

let created = 0;
let skipped = 0;

// Create SVG placeholders
objects.forEach(({ name, color, emoji }) => {
  const filename = path.join(OBJECTS_DIR, `${name}.svg`);
  
  if (fs.existsSync(filename)) {
    console.log(`  ⏭️  Skipping ${name} (already exists)`);
    skipped++;
    return;
  }

  // Create SVG with emoji and text
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="126" height="120" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="5" y="5" width="116" height="110" rx="15" ry="15" fill="${color}" opacity="0.9"/>
  
  <!-- Border -->
  <rect x="5" y="5" width="116" height="110" rx="15" ry="15" 
        fill="none" stroke="white" stroke-width="2"/>
  
  <!-- Emoji -->
  <text x="63" y="50" font-size="40" text-anchor="middle" font-family="Arial, sans-serif">
    ${emoji}
  </text>
  
  <!-- Text label -->
  <text x="63" y="95" font-size="14" font-weight="bold" text-anchor="middle" 
        font-family="Arial, sans-serif" fill="white" stroke="black" stroke-width="0.5">
    ${name}
  </text>
</svg>`;

  fs.writeFileSync(filename, svg, 'utf8');
  console.log(`  ✅ Created ${name}.svg`);
  created++;
});

console.log('\n📊 Summary:');
console.log(`  ✅ Created: ${created}`);
console.log(`  ⏭️  Skipped: ${skipped}`);
console.log(`  📁 Location: ${OBJECTS_DIR}`);

if (created > 0) {
  console.log('\n⚠️  Note: SVG files created as placeholders.');
  console.log('   The flash card system expects PNG files.');
  console.log('\n📋 Next steps:');
  console.log('   Option 1: Update food.js to use .svg extensions');
  console.log('   Option 2: Convert SVG to PNG using:');
  console.log('     • Online converter (e.g., cloudconvert.com)');
  console.log('     • ImageMagick: convert file.svg file.png');
  console.log('     • Inkscape: inkscape file.svg --export-png=file.png');
  console.log('   Option 3: Replace with proper PNG illustrations');
  console.log('\n   Then enable flash cards in src/config/flash-cards/index.js');
}
