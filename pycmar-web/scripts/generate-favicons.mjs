import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'favicon.svg');

const svgBuffer = readFileSync(svgPath);

// 32x32 PNG
const png32 = await sharp(svgBuffer, { density: 192 })
  .resize(32, 32)
  .png()
  .toBuffer();

writeFileSync(join(publicDir, 'favicon-32.png'), png32);
console.log('✓ favicon-32.png');

// 180x180 apple-touch-icon
const png180 = await sharp(svgBuffer, { density: 192 })
  .resize(180, 180)
  .png()
  .toBuffer();

writeFileSync(join(publicDir, 'apple-touch-icon.png'), png180);
console.log('✓ apple-touch-icon.png');

// ICO con PNG embebido (formato moderno compatible con todos los browsers)
const ICONDIR = Buffer.alloc(6);
ICONDIR.writeUInt16LE(0, 0); // reserved
ICONDIR.writeUInt16LE(1, 2); // type: 1 = ICO
ICONDIR.writeUInt16LE(1, 4); // count: 1 imagen

const ICONDIRENTRY = Buffer.alloc(16);
ICONDIRENTRY.writeUInt8(32, 0);          // width
ICONDIRENTRY.writeUInt8(32, 1);          // height
ICONDIRENTRY.writeUInt8(0, 2);           // colorCount
ICONDIRENTRY.writeUInt8(0, 3);           // reserved
ICONDIRENTRY.writeUInt16LE(1, 4);        // planes
ICONDIRENTRY.writeUInt16LE(32, 6);       // bitCount
ICONDIRENTRY.writeUInt32LE(png32.length, 8);  // bytes de la imagen
ICONDIRENTRY.writeUInt32LE(22, 12);      // offset = 6 + 16

const ico = Buffer.concat([ICONDIR, ICONDIRENTRY, png32]);
writeFileSync(join(publicDir, 'favicon.ico'), ico);
console.log('✓ favicon.ico');

console.log('\nFavicons regenerados con los colores correctos.');
