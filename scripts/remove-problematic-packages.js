// Postinstall script to remove problematic ES module packages
const fs = require('fs');
const path = require('path');

const packagesToRemove = [
  'html-encoding-sniffer',
  '@exodus/bytes',
  'jsdom',
  'dompurify',
  'isomorphic-dompurify'
];

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

function removePackage(pkgName) {
  const pkgPath = path.join(nodeModulesPath, pkgName);
  if (fs.existsSync(pkgPath)) {
    try {
      fs.rmSync(pkgPath, { recursive: true, force: true });
      console.log(`✓ Removed ${pkgPath}`);
    } catch (error) {
      console.warn(`⚠ Could not remove ${pkgPath}:`, error.message);
    }
  }
  
  // Also check in .pnpm directory structure
  const pnpmPath = path.join(nodeModulesPath, '.pnpm');
  if (fs.existsSync(pnpmPath)) {
    try {
      const entries = fs.readdirSync(pnpmPath, { withFileTypes: true });
      entries.forEach(entry => {
        if (entry.isDirectory() && entry.name.includes(pkgName)) {
          const fullPath = path.join(pnpmPath, entry.name);
          try {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`✓ Removed ${fullPath}`);
          } catch (error) {
            // Ignore errors for pnpm structure
          }
        }
      });
    } catch (error) {
      // Ignore if .pnpm doesn't exist or can't be read
    }
  }
}

console.log('Removing problematic ES module packages...');
packagesToRemove.forEach(removePackage);
console.log('Done!');
