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

function removeRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  try {
    const stats = fs.statSync(dirPath);
    if (stats.isDirectory()) {
      fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3 });
      return true;
    }
  } catch (error) {
    // Try alternative method
    try {
      const { execSync } = require('child_process');
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

function removePackage(pkgName) {
  // Remove from main node_modules
  const pkgPath = path.join(nodeModulesPath, pkgName);
  if (removeRecursive(pkgPath)) {
    console.log(`✓ Removed ${pkgName}`);
  }
  
  // Remove from .pnpm directory (pnpm structure)
  const pnpmPath = path.join(nodeModulesPath, '.pnpm');
  if (fs.existsSync(pnpmPath)) {
    try {
      const entries = fs.readdirSync(pnpmPath, { withFileTypes: true });
      entries.forEach(entry => {
        if (entry.isDirectory()) {
          // pnpm format: package@version or scoped packages
          if (entry.name.startsWith(pkgName + '@') || 
              entry.name.includes('@' + pkgName.replace('@', '')) ||
              entry.name === pkgName) {
            const fullPath = path.join(pnpmPath, entry.name);
            if (removeRecursive(fullPath)) {
              console.log(`✓ Removed .pnpm/${entry.name}`);
            }
          }
        }
      });
    } catch (error) {
      // Ignore if .pnpm doesn't exist or can't be read
    }
  }
  
  // Also remove @exodus scope if removing @exodus/bytes
  if (pkgName === '@exodus/bytes') {
    const exodusPath = path.join(nodeModulesPath, '@exodus');
    if (fs.existsSync(exodusPath)) {
      try {
        const entries = fs.readdirSync(exodusPath, { withFileTypes: true });
        entries.forEach(entry => {
          if (entry.isDirectory() && entry.name === 'bytes') {
            const bytesPath = path.join(exodusPath, entry.name);
            if (removeRecursive(bytesPath)) {
              console.log(`✓ Removed @exodus/bytes`);
            }
          }
        });
      } catch (error) {
        // Ignore
      }
    }
  }
}

console.log('Removing problematic ES module packages...');
packagesToRemove.forEach(removePackage);

// Also try to remove from .next cache if it exists
const nextCachePath = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextCachePath)) {
  try {
    const cachePath = path.join(nextCachePath, 'cache');
    if (fs.existsSync(cachePath)) {
      console.log('Clearing .next cache...');
      fs.rmSync(cachePath, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore cache clearing errors
  }
}

console.log('Done removing problematic packages!');
