#!/usr/bin/env node
// Standalone PDF text extraction script (CommonJS)
// Usage: node lib/extract-pdf.cjs <path-to-pdf>
// Outputs extracted text to stdout as JSON

// Polyfill DOMMatrix BEFORE anything else
try {
  const canvas = require('@napi-rs/canvas');
  if (canvas.DOMMatrix) globalThis.DOMMatrix = canvas.DOMMatrix;
  if (canvas.ImageData) globalThis.ImageData = canvas.ImageData;
  if (canvas.Path2D) globalThis.Path2D = canvas.Path2D;
} catch {}

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  process.stderr.write('Usage: node extract-pdf.cjs <path>\n');
  process.exit(1);
}

(async () => {
  try {
    const pdfjsLib = require('pdfjs-dist/build/pdf.mjs');
    const buf = fs.readFileSync(filePath);
    const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const doc = await pdfjsLib.getDocument({ data: uint8 }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => item.str).join(' '));
    }
    const text = pages.join('\n\n');
    process.stdout.write(JSON.stringify({ text, pages: doc.numPages, chars: text.length }));
  } catch (err) {
    process.stdout.write(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
})();
