import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitByUser } from "@/lib/rate-limit";

const Body = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    // --- RATE LIMIT ---
    const rl = await rateLimitByUser("fetch-doc", 20, 60 * 60 * 1000);
    if (rl.blocked) return rl.blocked;

    const { url } = Body.parse(await req.json());

    // Convert Google Docs URL to export format
    const docIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (!docIdMatch) {
      return NextResponse.json({ error: "Invalid Google Docs URL" }, { status: 400 });
    }

    const docId = docIdMatch[1];
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

    const res = await fetch(exportUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch document. Make sure it is set to 'Anyone with the link can view'." },
        { status: 400 }
      );
    }

    const text = await res.text();
    return NextResponse.json({ name: `Google Doc (${docId.slice(0, 8)}...)`, content: text });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to fetch document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
