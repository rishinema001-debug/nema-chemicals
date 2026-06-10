const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');

console.log("👀 Watching images/ folder for changes...");

let debounceTimer;
fs.watch(imagesDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log(`\n🔄 Image change detected (${filename}). Updating index...`);
            exec('node generate-image-index.js', (err, stdout, stderr) => {
                if (err) {
                    console.error("Error updating image index:", err);
                    return;
                }
                console.log(stdout.trim());
            });
        }, 500); // 500ms debounce
    }
});
