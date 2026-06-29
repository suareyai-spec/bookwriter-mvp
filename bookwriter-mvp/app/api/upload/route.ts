import { NextResponse } from "next/server";
import { rateLimitByUser } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

// Polyfill DOMMatrix for pdfjs-dist in Node.js environments that have it
if (typeof globalThis.DOMMatrix === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const canvas = require("@napi-rs/canvas");
    if (canvas.DOMMatrix) globalThis.DOMMatrix = canvas.DOMMatrix;
    if (canvas.ImageData && !globalThis.ImageData) globalThis.ImageData = canvas.ImageData;
    if (canvas.Path2D && !globalThis.Path2D) globalThis.Path2D = canvas.Path2D;
  } catch {
    // canvas not available — pdfjs text layer still works without it
  }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

async function extractWithClaude(buffer: Buffer, fileName: string): Promise<string> {
  const base64 = buffer.toString("base64");
  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extract all text from this PDF document. Return only the raw text content, preserving the original paragraphs, headings, and structure as closely as possible. Do not add any commentary, explanation, or formatting of your own — just the extracted text.",
          },
        ],
      },
    ],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

async function extractWithPdfjs(buffer: Buffer): Promise<string> {
  const fs = await import("fs");
  const path = await import("path");
  const { execSync } = await import("child_process");
  const tmpPath = path.join("/tmp", `upload_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
  fs.writeFileSync(tmpPath, buffer);
  try {
    const scriptPath = path.join(process.cwd(), "lib", "extract-pdf.cjs");
    const result = execSync(`node "${scriptPath}" "${tmpPath}"`, {
      maxBuffer: 50 * 1024 * 1024,
      timeout: 30000,
    }).toString();
    const parsed = JSON.parse(result);
    if (parsed.error) throw new Error(parsed.error);
    return parsed.text || "";
  } finally {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}

export async function POST(req: Request) {
  try {
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
      let method = "pdfjs";

      // Step 1: try fast text-layer extraction
      try {
        text = await extractWithPdfjs(buffer);
        console.log(`[upload] pdfjs extracted ${text.length} chars from "${file.name}"`);
      } catch (err: any) {
        console.warn(`[upload] pdfjs failed for "${file.name}":`, err?.message);
      }

      // Step 2: fall back to Claude native PDF reading for image-based / scanned PDFs
      if (text.trim().length < 100) {
        method = "claude-vision";
        console.log(`[upload] Falling back to Claude vision for "${file.name}"`);
        try {
          text = await extractWithClaude(buffer, file.name);
          console.log(`[upload] Claude extracted ${text.length} chars from "${file.name}"`);
        } catch (visionErr: any) {
          console.error(`[upload] Claude vision failed for "${file.name}":`, visionErr?.message);
          text = "";
        }
      }

      if (!text.trim()) {
        return NextResponse.json(
          { error: `Could not extract text from "${file.name}". The file may be encrypted or corrupted.` },
          { status: 400 }
        );
      }

      console.log(`[upload] "${file.name}" done via ${method} — ${text.length} chars`);
      results.push({ name: file.name, content: text });
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
