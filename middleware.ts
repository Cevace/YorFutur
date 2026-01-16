import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    // Refresh session
    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // ============================================
    // PUBLIC PATHS - No auth required
    // ============================================
    // Exact matches (static pages)
    const exactPublicPaths = [
        '/',
        '/home',
        '/under-construction',
        '/login',
        '/pricing',
        '/privacy',
        '/faq',
        '/onboarding',
    ];

    // Prefix matches (dynamic routes, all subpaths allowed)
    const publicPrefixes = [
        '/auth/',       // Auth callbacks
        '/blog',        // Blog pages including /blog/slug
        '/landing/',    // Marketing landing pages
        '/keystatic',   // CMS (has its own auth)
        '/api/',        // API routes (have their own auth)
    ];

    // Check if path is public
    const isExactPublicPath = exactPublicPaths.includes(path);
    const isPrefixPublicPath = publicPrefixes.some(prefix => path.startsWith(prefix));
    const isStaticAsset = path.includes('.') && !path.startsWith('/api/');

    const isPublic = isExactPublicPath || isPrefixPublicPath || isStaticAsset;

    // ============================================
    // REDIRECT RULES
    // ============================================

    // Rule 1: Logged-in users trying to access under-construction → dashboard
    if (user && path === '/under-construction') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Rule 2: Logged-in users trying to access login → dashboard
    if (user && path === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Rule 3: Non-logged-in users on protected paths → under-construction
    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/under-construction', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - Static assets (.svg, .png, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
