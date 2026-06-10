#!/usr/bin/env node
// ===== Generate Image Index =====
// Run this script after adding new images to images/ or images/products/
// Usage: node generate-image-index.js

const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const imgRegex = /\.(png|jpe?g|gif|webp|svg)$/i;

// Skip non-product files
const SKIP_PATTERNS = [/^\.DS_Store/];

function shouldSkip(filename) {
  return SKIP_PATTERNS.some(p => p.test(filename));
}

const entries = [];

// Root images/
if (fs.existsSync(imagesDir)) {
  fs.readdirSync(imagesDir)
    .filter(f => imgRegex.test(f) && !fs.statSync(path.join(imagesDir, f)).isDirectory() && !shouldSkip(f))
    .sort()
    .forEach(f => entries.push(`  "${f}"`));
}

// images/products/
const productsDir = path.join(imagesDir, 'products');
if (fs.existsSync(productsDir)) {
  fs.readdirSync(productsDir)
    .filter(f => imgRegex.test(f) && !shouldSkip(f))
    .sort()
    .forEach(f => entries.push(`  "products/${f}"`));
}

const output = `// ===== NEMA Chemicals — Static Image Index =====
// Auto-generated list of all product images in images/ and images/products/
// Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
// To update: run \`node generate-image-index.js\` after adding new images.

const IMAGE_INDEX = [
${entries.join(',\n')},
];
`;

fs.writeFileSync(path.join(__dirname, 'image-index.js'), output, 'utf-8');
console.log(`✅ image-index.js generated with ${entries.length} images.`);
