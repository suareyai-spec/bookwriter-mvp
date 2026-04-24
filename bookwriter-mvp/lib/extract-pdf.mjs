// Standalone PDF text extraction script
// Usage: node lib/extract-pdf.mjs <path-to-pdf>
// Outputs extracted text to stdout

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Polyfill DOMMatrix BEFORE loading pdfjs-dist
try {
  const canvas = require('@napi-rs/canvas');
  if (canvas.DOMMatrix) globalThis.DOMMatrix = canvas.DOMMatrix;
  if (canvas.ImageData) globalThis.ImageData = canvas.ImageData;
  if (canvas.Path2D) globalThis.Path2D = canvas.Path2D;
} catch {}

// Dynamic import AFTER polyfill
const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
import { readFileSync } from 'fs';

const filePath = process.argv[2];
if (!filePath) {
  process.stderr.write('Usage: node extract-pdf.mjs <path>\n');
  process.exit(1);
}

try {
  const buf = readFileSync(filePath);
  const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  const doc = await pdfjsLib.getDocument({ data: uint8 }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(' '));
  }
  process.stdout.write(pages.join('\n\n'));
} catch (err) {
  process.stderr.write('PDF extraction failed: ' + err.message + '\n');
  process.exit(1);
}
