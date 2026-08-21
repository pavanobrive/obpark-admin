import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // We want to skip redirecting for:
  // - / (home)
  // - /about
  // - /coming-soon
  // - Next.js internal paths, API, and static files
  if (
    path === '/' ||
    path === '/about' ||
    path === '/solutions' ||
    path === '/invest' ||
    path === '/partners' ||
    path === '/coming-soon' ||
    path === '/faq' ||
    path === '/our-story' ||
    path === '/shipping-policy' ||
    path === '/refund-policy' ||
    path === '/contact' ||
    path === '/privacy-policy' ||
    path === '/platform-policy' ||
    path === '/business-policy' ||
    path === '/enterprise-regulatory' ||
    path === '/cookie-policy' ||
    path === '/legal-compliance' ||
    path === '/user-rights' ||
    path === '/merchant-services' ||
    path === '/governing-law' ||
    path === '/cancellation-policy' ||
    path === '/terms-and-conditions' ||
    path === '/e-challan' ||
    path === '/register' ||
    path.startsWith('/cart') ||
    path.startsWith('/checkout') ||
    path.startsWith('/payment') ||
    path.startsWith('/login') ||
    path.startsWith('/account') ||
    path.startsWith('/admin') ||
    path.startsWith('/services') ||
    path.startsWith('/category') ||
    path.startsWith('/product')  ||
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/Images') || 
    path === '/favicon.ico' ||
    path.match(/\.(.*)$/) // Skip all files with extensions to allow assets
  ) {
    return NextResponse.next();
  }

  // Redirect all other paths to /coming-soon
  return NextResponse.redirect(new URL('/coming-soon', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
