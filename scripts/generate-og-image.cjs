const fs = require('fs');
const path = require('path');

// Load the font as base64 for embedding in SVG
const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'atkinson-mono-latin.woff2');
const fontBase64 = fs.readFileSync(fontPath).toString('base64');

const SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Atkinson Hyperlegible Mono';
        src: url(data:font/woff2;base64,${fontBase64}) format('woff2');
        font-weight: 200 800;
        font-style: normal;
      }
    </style>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="1200" height="630" fill="#000000"/>
  
  ${Array.from({length: 315}, (_, i) => 
    `<rect x="0" y="${i*2}" width="1200" height="1" fill="rgba(0,0,0,0.15)"/>`
  ).join('\n  ')}
  
  <text x="600" y="220" text-anchor="middle" font-family="Atkinson Hyperlegible Mono, monospace" font-size="72" font-weight="bold" fill="#00ff00" filter="url(#glow)">&gt; what day is it?_</text>
  
  <text x="600" y="320" text-anchor="middle" font-family="Atkinson Hyperlegible Mono, monospace" font-size="28" fill="#00ff00" opacity="0.8">the world's first decentralized day-of-week oracle</text>
  
  <text x="600" y="420" text-anchor="middle" font-family="Atkinson Hyperlegible Mono, monospace" font-size="24" fill="#00ff00" opacity="0.6">MON · TUE · WED · THU · FRI · SAT · SUN</text>
  
  <text x="600" y="520" text-anchor="middle" font-family="Atkinson Hyperlegible Mono, monospace" font-size="20" fill="yellow" opacity="0.9">the market decides.</text>
  
  <text x="600" y="580" text-anchor="middle" font-family="Atkinson Hyperlegible Mono, monospace" font-size="18" fill="#00ff00" opacity="0.4">whatday.xyz</text>
</svg>`;

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'og-image.svg'), SVG);
console.log('Generated og-image.svg');

try {
  const sharp = require('sharp');
  sharp(Buffer.from(SVG))
    .png()
    .toFile(path.join(outDir, 'og-image.png'))
    .then(() => console.log('Generated og-image.png'))
    .catch(err => console.log('PNG failed:', err.message));
} catch {
  console.log('sharp not installed');
}
