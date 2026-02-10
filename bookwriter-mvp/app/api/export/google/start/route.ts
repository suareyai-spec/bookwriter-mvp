import { NextResponse } from "next/server";

export async function GET() {
  // Hook endpoint: implement OAuth + Docs API write here.
  // For now, this returns setup instructions.
  return NextResponse.json({
    ok: true,
    message:
      "Google Docs export hook is scaffolded. Next step: add OAuth flow and write document via Google Docs API.",
  });
}
