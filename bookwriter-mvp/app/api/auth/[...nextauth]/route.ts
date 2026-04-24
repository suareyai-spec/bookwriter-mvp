import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimitByIP } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const nextAuth = NextAuth(authOptions);

async function GET(...args: Parameters<typeof nextAuth>) {
  return nextAuth(...args);
}

async function POST(req: Request, ctx: any) {
  const rl = rateLimitByIP(req, "auth", 10, 15 * 60 * 1000);
  if (rl.blocked) return rl.blocked;
  return (nextAuth as any)(req, ctx);
}

export { GET, POST };
