import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref');
  const response = NextResponse.next();
  if (ref && /^[a-zA-Z0-9_-]{3,30}$/.test(ref)) {
    response.cookies.set('plotghost_ref', ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // client-readable so JS can send it
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
