const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const iconDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Create clean SVG for PWA icons
function createSvgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.03}" stdDeviation="${size * 0.04}" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bgGrad)" />
  
  <!-- Coin circle -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.32}" fill="#F59E0B" filter="url(#shadow)" stroke="#FEF3C7" stroke-width="${size * 0.02}" />
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.27}" fill="none" stroke="#D97706" stroke-width="${size * 0.015}" stroke-dasharray="${size * 0.03} ${size * 0.015}" />
  
  <!-- MT / Trend icon inside coin -->
  <path d="M ${size * 0.38} ${size * 0.62} L ${size * 0.38} ${size * 0.44} L ${size * 0.46} ${size * 0.53} L ${size * 0.54} ${size * 0.44} L ${size * 0.54} ${size * 0.62}" 
        fill="none" stroke="#FFFFFF" stroke-width="${size * 0.035}" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M ${size * 0.54} ${size * 0.45} L ${size * 0.64} ${size * 0.37} M ${size * 0.64} ${size * 0.37} L ${size * 0.58} ${size * 0.37} M ${size * 0.64} ${size * 0.37} L ${size * 0.64} ${size * 0.43}" 
        fill="none" stroke="#FFFFFF" stroke-width="${size * 0.035}" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;
}

fs.writeFileSync(path.join(iconDir, 'icon-192.svg'), createSvgIcon(192));
fs.writeFileSync(path.join(iconDir, 'icon-512.svg'), createSvgIcon(512));
console.log('SVG Icons created.');
