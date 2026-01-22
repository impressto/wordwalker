#!/usr/bin/env node
/**
 * Update Service Worker with Dynamic Chunks
 * 
 * This script runs after Vite build to:
 * 1. Scan the dist/assets directory for generated chunk files
 * 2. Update the service worker to include these chunks in CORE_ASSETS
 * 3. Ensure offline-first PWA functionality with lazy-loaded modules
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist/assets');
const SERVICE_WORKER_PATH = join(__dirname, '../public/service-worker.js');
const SERVICE_WORKER_DIST_PATH = join(__dirname, '../dist/service-worker.js');

// Read the dist/assets directory
console.log('📦 Scanning for generated chunks...');
const files = readdirSync(DIST_DIR);

// Find all question and translation chunks
const questionChunks = files.filter(f => f.startsWith('q-') && f.endsWith('.js'));
const translationChunks = files.filter(f => f.startsWith('translations-') && f.endsWith('.js'));
const coreChunks = files.filter(f => (f === 'index.js' || f === 'vendor.js' || f.startsWith('index-') || f.startsWith('vendor-')) && f.endsWith('.js'));
const cssFiles = files.filter(f => f.endsWith('.css'));

console.log(`✓ Found ${questionChunks.length} question chunks`);
console.log(`✓ Found ${translationChunks.length} translation chunks`);
console.log(`✓ Found ${coreChunks.length} core chunks`);
console.log(`✓ Found ${cssFiles.length} CSS files`);

// Build the assets array
const dynamicAssets = [
  ...coreChunks.map(f => `/wordwalker/dist/assets/${f}`),
  ...cssFiles.map(f => `/wordwalker/dist/assets/${f}`),
  ...questionChunks.map(f => `/wordwalker/dist/assets/${f}`),
  ...translationChunks.map(f => `/wordwalker/dist/assets/${f}`)
];

// Read the service worker template
console.log('📝 Updating service worker...');
let swContent = readFileSync(SERVICE_WORKER_PATH, 'utf-8');

// Find and replace the JS/CSS assets in CORE_ASSETS
// Look for the pattern between manifest.json and Essential icons comment
const assetsPattern = /(\/wordwalker\/dist\/manifest\.json',\n)([\s\S]*?)(  \/\/ Essential icons)/;

const dynamicAssetsStr = dynamicAssets.map(asset => `  '${asset}',`).join('\n');

swContent = swContent.replace(assetsPattern, (match, before, oldAssets, after) => {
  return before + dynamicAssetsStr + '\n' + after;
});

// Write updated service worker to public (for dev) and dist (for production)
writeFileSync(SERVICE_WORKER_PATH, swContent);
writeFileSync(SERVICE_WORKER_DIST_PATH, swContent);

console.log('✅ Service worker updated successfully!');
console.log(`   ${dynamicAssets.length} dynamic assets will be cached for offline support`);
