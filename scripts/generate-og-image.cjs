const fs = require('fs');
const path = require('path');

const SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="#000000"/>
  
  <!-- Scanlines -->
  ${Array.from({length: 315}, (_, i) => 
    `<rect x="0" y="${i*2}" width="1200" height="1" fill="rgba(0,0,0,0.15)"/>`
  ).join('\n  ')}
  
  <!-- Main text -->
  <text x="600" y="220" text-anchor="middle" font-family="Comic Sans MS, Comic Sans, cursive, sans-serif" font-size="72" font-weight="bold" fill="#00ff00" filter="url(#glow)">&gt; what day is it?_</text>
  
  <!-- Subtitle -->
  <text x="600" y="320" text-anchor="middle" font-family="Comic Sans MS, Comic Sans, cursive, sans-serif" font-size="28" fill="#00ff00" opacity="0.8">the world's first decentralized day-of-week oracle</text>
  
  <!-- Day tokens -->
  <text x="600" y="420" text-anchor="middle" font-family="Comic Sans MS, Comic Sans, cursive, sans-serif" font-size="24" fill="#00ff00" opacity="0.6">MON · TUE · WED · THU · FRI · SAT · SUN</text>
  
  <!-- Bottom text -->
  <text x="600" y="520" text-anchor="middle" font-family="Comic Sans MS, Comic Sans, cursive, sans-serif" font-size="20" fill="yellow" opacity="0.9">the market decides.</text>
  
  <!-- URL -->
  <text x="600" y="580" text-anchor="middle" font-family="Comic Sans MS, Comic Sans, cursive, sans-serif" font-size="18" fill="#00ff00" opacity="0.4">whatday.xyz</text>
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
