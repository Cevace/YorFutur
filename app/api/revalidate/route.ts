'use server';

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Secret token for security (should match env variable)
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'cevace-revalidate-2024';

/**
 * API Route for On-Demand Revalidation
 * 
 * Usage: POST /api/revalidate
 * Headers: { "x-revalidate-secret": "your-secret" }
 * Body: { "path": "/blog" } or { "path": "/blog/slug" }
 * 
 * Keystatic can call this endpoint after saving content.
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('x-revalidate-secret');

        // Simple security check
        if (authHeader !== REVALIDATE_SECRET) {
            return NextResponse.json(
                { error: 'Invalid secret' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const pathToRevalidate = body.path || '/blog';

        // Revalidate the specified path
        revalidatePath(pathToRevalidate);

        // Also revalidate blog index when a post changes
        if (pathToRevalidate.startsWith('/blog/')) {
            revalidatePath('/blog');
        }

        console.log(`[Revalidate] Successfully revalidated: ${pathToRevalidate}`);

        return NextResponse.json({
            success: true,
            revalidated: pathToRevalidate,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Revalidate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to revalidate' },
            { status: 500 }
        );
    }
}

// Also support GET for easy testing in browser
export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');
    const path = request.nextUrl.searchParams.get('path') || '/blog';

    if (secret !== REVALIDATE_SECRET) {
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    revalidatePath(path);

    if (path.startsWith('/blog/')) {
        revalidatePath('/blog');
    }

    return NextResponse.json({
        success: true,
        revalidated: path,
        timestamp: new Date().toISOString()
    });
}
