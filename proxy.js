import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('client_token');

  const isPortalRoute = pathname.startsWith('/portal');
  const isAuthRoute = pathname === '/';

  // No token → block portal access
  if (isPortalRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Already has a token → skip login page
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/portal/:path*'],
};


