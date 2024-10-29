import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { signOut } from 'next-auth/react';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    const publicRoutes = ['/login', '/register', '/reset-password', '/verifyemail'];

    // Check if the user is authenticated
    const isAuthenticated = !!token;

    // Redirect to login if trying to access a protected route without authentication
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control
    if (isAuthenticated && token.role) {
        const userRole = token.role;
        // console.log("token", token)
        // if (Boolean(token?.twoFactorEnabled) && userRole !== "admin") {
        //     return NextResponse.redirect(new URL('/setup-2fa', req.url));
        // }

        if (pathname.startsWith('/dashboard') && userRole !== 'admin') {
            if (typeof window !== 'undefined') {
                await signOut()
            }
            return NextResponse.redirect(new URL('/login', req.url)); // Redirect to home or another page
        }
    }

    return NextResponse.next();
}

// Specify the paths to apply the middleware
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Exclude API routes and static files
};

