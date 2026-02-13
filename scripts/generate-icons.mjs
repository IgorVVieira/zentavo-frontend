import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public', 'icons');

mkdirSync(outputDir, { recursive: true });

function createSvg(size) {
  const fontSize = Math.round(size * 0.55);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#1976d2"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}" font-weight="700" fill="#ffffff">$</text>
    </svg>
  `);
}

const icons = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const icon of icons) {
  await sharp(createSvg(icon.size))
    .png()
    .toFile(join(outputDir, icon.name));
  console.log(`Generated ${icon.name}`);
}

console.log('All icons generated!');
