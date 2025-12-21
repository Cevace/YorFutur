import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    // 1. Update Session and get the response object (which has updated cookies)
    // We'll modify updateSession to return both response and user, or we parse it here.
    // Actually, let's just copy the logic effectively or use the response.

    // Better approach: Let's use the standard Supabase Middleware pattern directly here
    // to ensure we have the user and the correct response with cookies.

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    );

    // This refreshes the session if needed
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Define Protected Scope
    const path = request.nextUrl.pathname;

    // Allowed public paths
    const publicPaths = [
        '/under-construction',
        '/login',
        '/auth/callback',
        '/pricing',
        '/privacy'
    ];

    const isPublicPath = publicPaths.some(p => path === p || path.startsWith('/auth/'));
    const isApi = path.startsWith('/api/');
    const isStatic = path.startsWith('/_next/') || path.startsWith('/static/') || path.includes('.') || path === '/favicon.ico';

    // 3. User Check & Redirects

    // If user is logged in
    if (user) {
        // If they try to go to under-construction, redirect to dashboard
        if (path === '/under-construction') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // If user is NOT logged in
    if (!user && !isPublicPath && !isApi && !isStatic) {
        // Redirect to Under Construction
        return NextResponse.redirect(new URL('/under-construction', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
