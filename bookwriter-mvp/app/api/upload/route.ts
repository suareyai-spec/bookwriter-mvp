import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      results.push({ name: file.name, content: data.text });
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
