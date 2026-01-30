// This script removes problematic packages that cause build issues
// It's called during the Vercel build process

const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(process.cwd(), 'node_modules');

// List of problematic packages to check/remove if they exist
const problematicPackages = [
  'html-encoding-sniffer',
  '@exodus/bytes',
  'jsdom',
  'dompurify',
  'isomorphic-dompurify'
];

function removePackage(packageName) {
  const packagePath = path.join(nodeModulesPath, packageName);
  if (fs.existsSync(packagePath)) {
    try {
      fs.rmSync(packagePath, { recursive: true, force: true });
      console.log(`Removed ${packageName}`);
    } catch (error) {
      console.warn(`Could not remove ${packageName}:`, error.message);
    }
  }
}

// Remove problematic packages
problematicPackages.forEach(removePackage);

console.log('Cleanup completed');
