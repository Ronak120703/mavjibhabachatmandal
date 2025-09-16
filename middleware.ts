import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect draw page
  if (pathname.startsWith('/draw')) {
    const isAdmin = request.cookies.get('admin_auth')?.value === '1';
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/draw/:path*'],
};


