#!/usr/bin/env node

/**
 * Vaultix Bot ZIP Generator
 * Run this script to create a downloadable ZIP file of the complete bot
 * Usage: node generate-zip.js
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const OUTPUT_FILE = 'vaultix-bot.zip';
const BOT_DIR = path.join(__dirname, 'bot');

console.log('✨ Generating Vaultix Bot ZIP file...\n');

// Create output stream
const output = fs.createWriteStream(path.join(__dirname, OUTPUT_FILE));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for events
output.on('close', () => {
  console.log(`\n✅ Successfully created ${OUTPUT_FILE}`);
  console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Extract ${OUTPUT_FILE}`);
  console.log(`   2. Copy .env.example to .env and fill in your Discord bot token`);
  console.log(`   3. Run: npm install`);
  console.log(`   4. Run: npm run build`);
  console.log(`   5. Run: npm run deploy`);
  console.log(`   6. Run: npm start`);
});

archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to file
archive.pipe(output);

// Function to add directory recursively
function addDirectory(dirPath, zipPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    // Skip node_modules, dist, and .db files
    if (item === 'node_modules' || item === 'dist' || item.endsWith('.db')) {
      continue;
    }
    
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    const itemZipPath = path.join(zipPath, item);
    
    if (stat.isDirectory()) {
      addDirectory(fullPath, itemZipPath);
    } else {
      archive.file(fullPath, { name: itemZipPath });
      console.log(`  📄 Added: ${itemZipPath}`);
    }
  }
}

// Add all bot files
console.log('📁 Adding bot files...\n');
addDirectory(BOT_DIR, 'vaultix-bot');

// Finalize the archive
archive.finalize();
