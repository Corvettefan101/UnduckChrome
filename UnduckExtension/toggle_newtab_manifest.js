// Node.js script to toggle chrome_url_overrides in manifest.json based on chrome.storage.sync setting
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'manifest.json');
const chrome = require('chrome-remote-interface');

function updateManifest(enableUnduckNewTab) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (enableUnduckNewTab) {
    manifest.chrome_url_overrides = { "newtab": "newtab.html" };
  } else {
    delete manifest.chrome_url_overrides;
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated. Please reload the extension in chrome://extensions.');
}

// Usage: node toggle_newtab_manifest.js [on|off]
const arg = process.argv[2];
if (arg === 'on') {
  updateManifest(true);
} else if (arg === 'off') {
  updateManifest(false);
} else {
  console.log('Usage: node toggle_newtab_manifest.js [on|off]');
}
