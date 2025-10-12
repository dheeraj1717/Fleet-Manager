import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If accessing public route, allow
  if (isPublicRoute) {
    // If already logged in, redirect to home
    if (accessToken) {
      const userId = await verifyAccessToken(accessToken);
      if (userId) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes - need authentication
  
  // No tokens at all - redirect to login
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Has access token - verify it
  if (accessToken) {
    const userId = await verifyAccessToken(accessToken);
    if (userId) {
      // Valid access token, allow request
      return NextResponse.next();
    }
  }

  // Access token invalid/expired, try to refresh
  if (refreshToken) {
    try {
      // Call refresh endpoint
      const refreshResponse = await fetch(
        new URL('/api/auth/refresh', request.url),
        {
          method: 'POST',
          headers: {
            Cookie: `refreshToken=${refreshToken}`,
          },
        }
      );

      if (refreshResponse.ok) {
        // Get the new access token from response cookies
        const newAccessToken = refreshResponse.headers
          .get('set-cookie')
          ?.match(/accessToken=([^;]+)/)?.[1];

        if (newAccessToken) {
          // Create response with new access token
          const response = NextResponse.next();
          response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 15, // 15 minutes
            path: '/',
          });
          return response;
        }
      }
    } catch (error) {
      console.error('Middleware refresh failed:', error);
    }
  }

  // If we got here, authentication failed - redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};