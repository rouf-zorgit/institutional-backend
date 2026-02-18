import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/courses',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/verify',
    '/api/courses/public',
];

// Role-based route protection
const PROTECTED_ROUTES: Record<string, string[]> = {
    '/admin': ['SUPER_ADMIN', 'ADMIN'],
    '/teacher': ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
    '/student': ['SUPER_ADMIN', 'ADMIN', 'STUDENT'],
    '/staff': ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
    '/api/admin': ['SUPER_ADMIN', 'ADMIN'],
    '/api/teacher': ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
    '/api/student': ['SUPER_ADMIN', 'ADMIN', 'STUDENT'],
};

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => {
        if (route.endsWith('*')) {
            return pathname.startsWith(route.slice(0, -1));
        }
        return pathname === route || pathname.startsWith(route + '/');
    });
}

/**
 * Get required roles for a route
 */
function getRequiredRoles(pathname: string): string[] | null {
    for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
        if (pathname.startsWith(route)) {
            return roles;
        }
    }
    return null;
}

/**
 * Redirect to login with return URL
 */
function redirectToLogin(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
}

/**
 * Redirect to unauthorized page
 */
function redirectToUnauthorized(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
        // Redirect to login for page routes
        if (!pathname.startsWith('/api')) {
            return redirectToLogin(request);
        }

        // Return 401 for API routes
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No token provided',
                    statusCode: 401,
                },
            },
            { status: 401 }
        );
    }

    try {
        // Verify JWT (stateless - no DB query!)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(accessToken, secret);

        // Check if token type is correct
        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }

        // Check role-based access
        const requiredRoles = getRequiredRoles(pathname);

        if (requiredRoles) {
            const userRole = payload.role as string;

            if (!requiredRoles.includes(userRole)) {
                // Redirect to unauthorized page for page routes
                if (!pathname.startsWith('/api')) {
                    return redirectToUnauthorized(request);
                }

                // Return 403 for API routes
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'FORBIDDEN',
                            message: 'Access denied',
                            statusCode: 403,
                        },
                    },
                    { status: 403 }
                );
            }
        }

        // Add user info to request headers (available in API routes and server components)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.sub as string);
        requestHeaders.set('x-user-role', payload.role as string);
        requestHeaders.set('x-user-email', payload.email as string);
        requestHeaders.set('x-user-status', payload.status as string);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        // Token expired or invalid
        console.error('JWT verification failed:', error);

        // Try to refresh token
        const refreshToken = request.cookies.get('refresh_token')?.value;

        if (refreshToken) {
            try {
                // Call refresh endpoint
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/api/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const { access_token, refresh_token: new_refresh_token } = data.data;

                    // Set new tokens in cookies
                    const res = NextResponse.next();
                    res.cookies.set('access_token', access_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 60, // 15 minutes
                        path: '/',
                    });
                    res.cookies.set('refresh_token', new_refresh_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 7 * 24 * 60 * 60, // 7 days
                        path: '/',
                    });

                    return res;
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
            }
        }

        // Clear invalid tokens
        const response = pathname.startsWith('/api')
            ? NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Invalid or expired token',
                        statusCode: 401,
                    },
                },
                { status: 401 }
            )
            : redirectToLogin(request);

        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');

        return response;
    }
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - images, fonts, etc.
         */
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|woff|woff2|ttf|otf)$).*)',
    ],
};
