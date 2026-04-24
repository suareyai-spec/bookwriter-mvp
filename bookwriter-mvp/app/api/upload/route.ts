import { NextResponse } from "next/server";
import { rateLimitByUser } from "@/lib/rate-limit";

// Polyfill DOMMatrix for pdf-parse/pdfjs-dist in Node.js
if (typeof globalThis.DOMMatrix === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const canvas = require("@napi-rs/canvas");
    if (canvas.DOMMatrix) globalThis.DOMMatrix = canvas.DOMMatrix;
    if (canvas.ImageData && !globalThis.ImageData) globalThis.ImageData = canvas.ImageData;
    if (canvas.Path2D && !globalThis.Path2D) globalThis.Path2D = canvas.Path2D;
  } catch {
    // Canvas not available
  }
}

export async function POST(req: Request) {
  try {
    // --- RATE LIMIT ---
    const rl = await rateLimitByUser("upload", 20, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 files allowed" }, { status: 400 });
    }

    const results: { name: string; content: string }[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File "${file.name}" exceeds 10MB limit` }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json({ error: `File "${file.name}" is not a PDF` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      let text = "";
      try {
        // Write PDF to temp file, extract via standalone script (avoids Next.js bundling issues with pdfjs-dist)
        const fs = await import("fs");
        const path = await import("path");
        const { execSync } = await import("child_process");
        const tmpPath = path.join("/tmp", `upload_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
        fs.writeFileSync(tmpPath, buffer);
        const scriptPath = path.join(process.cwd(), "lib", "extract-pdf.cjs");
        const result = execSync(`node "${scriptPath}" "${tmpPath}"`, { maxBuffer: 50 * 1024 * 1024, timeout: 30000 }).toString();
        fs.unlinkSync(tmpPath);
        const parsed = JSON.parse(result);
        if (parsed.error) throw new Error(parsed.error);
        text = parsed.text || "";
        console.log(`[upload] Extracted ${text.length} chars from ${file.name} (${parsed.pages} pages)`);
      } catch (pdfErr: any) {
        console.error(`[upload] PDF extraction failed for ${file.name}:`, pdfErr?.message || pdfErr);
        text = "";
      }
      console.log(`[upload] Extracted ${text.length} chars from ${file.name}`);
      if (!text.trim()) {
        return NextResponse.json({ error: `Could not extract text from "${file.name}". The PDF may be image-based or encrypted.` }, { status: 400 });
      }
      results.push({ name: file.name, content: text });
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
