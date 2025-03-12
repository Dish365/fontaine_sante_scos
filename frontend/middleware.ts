import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log all API requests
  console.log(`${request.method} ${request.nextUrl.pathname}`);
  
  // Continue with the request - our client-side hooks will handle data directly
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};