export interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  count: number;
}

export function extractColors(imageUrl: string, maxColors: number = 5): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve([]); return; }

        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size).data;

        // Count pixel colors (quantized to reduce noise)
        const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

        for (let i = 0; i < imageData.length; i += 4) {
          const r = Math.round(imageData[i] / 16) * 16;
          const g = Math.round(imageData[i + 1] / 16) * 16;
          const b = Math.round(imageData[i + 2] / 16) * 16;
          const a = imageData[i + 3];

          // Skip transparent and near-white/near-black pixels
          if (a < 128) continue;
          if (r > 240 && g > 240 && b > 240) continue;
          if (r < 15 && g < 15 && b < 15) continue;

          const key = `${r},${g},${b}`;
          const existing = colorMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorMap.set(key, { r, g, b, count: 1 });
          }
        }

        // Sort by frequency and take top colors
        const sorted = Array.from(colorMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, maxColors * 3); // Get more, then filter similar

        // Filter out similar colors
        const result: ExtractedColor[] = [];
        for (const color of sorted) {
          if (result.length >= maxColors) break;
          const tooSimilar = result.some(existing =>
            Math.abs(existing.r - color.r) + Math.abs(existing.g - color.g) + Math.abs(existing.b - color.b) < 60
          );
          if (!tooSimilar) {
            const hex = '#' + [color.r, color.g, color.b].map(c => Math.min(255, c).toString(16).padStart(2, '0')).join('');
            result.push({ hex, r: color.r, g: color.g, b: color.b, count: color.count });
          }
        }

        resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}
